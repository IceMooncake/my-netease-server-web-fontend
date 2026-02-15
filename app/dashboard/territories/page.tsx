'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TerritoryService, TerritoryListResponse } from '@/app/api';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function TerritoriesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [territories, setTerritories] = useState<TerritoryListResponse>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
        router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
        const loadData = async () => {
             try {
                const myTerritories = await TerritoryService.getTerritoriesMine();
                setTerritories(myTerritories);
             } catch (e) {
                 console.error(e);
             }
        };
        loadData();
    }
  }, [isAuthenticated]);

  if (isLoading || !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout title="我的领地">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
             <p className="text-gray-500 text-sm">共加入 {territories.length} 个领地</p>
             <Link href="/dashboard/territories/create">
                <Button>创建新领地</Button>
             </Link>
        </div>

        {territories.length === 0 ? (
             <div className="text-center py-12">
                 <p className="text-gray-500 mb-4">您还没有加入任何领地</p>
                 <Link href="/dashboard/territories/create">
                    <Button>创建领地</Button>
                 </Link>
             </div>
        ) : (
            <div className="space-y-3">
                {territories.map(territory => (
                    <Link key={territory.id} href={`/dashboard/territories/${territory.id}`}>
                        <Card className="flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div>
                                <h4 className="font-bold text-gray-800">{territory.name}</h4>
                                <div className="flex space-x-2 mt-1">
                                     <span className="text-xs text-gray-500">坐标: ({territory.x1}, {territory.z1})</span>
                                     <span className="text-xs text-gray-500">面积: {territory.area}</span>
                                     <Badge variant={territory.status === 'ACTIVE' ? 'success' : 'default'}>
                                        {territory.status}
                                     </Badge>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-blue-600">{territory.credits} 方块</p>
                                <Badge variant={territory.owner_id === user.qq ? 'warning' : 'default'} className="mt-1">
                                    {territory.owner_id === user.qq ? '地主' : '成员'}
                                </Badge>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}
