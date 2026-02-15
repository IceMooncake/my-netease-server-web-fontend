'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TerritoryService, TerritoryListResponse } from '@/app/api';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
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

  // Calculate stats
  const totalTerritories = territories.length;

  return (
    <DashboardLayout title="概览">
      <div className="space-y-6">
        {/* User Stats */}
        <Card className="bg-linear-to-r from-blue-500 to-blue-600 text-white border-none">
           <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                 {user.qq.slice(0, 2)}
              </div>
              <div>
                  <h2 className="text-xl font-bold">{user.nick_name || user.qq}</h2>
                  <p className="text-blue-100">QQ: {user.qq}</p>
              </div>
           </div>
           <div className="mt-4 pt-4 border-t border-white/20 flex justify-between">
              <div>
                  <p className="text-sm text-blue-100">个人方块额度</p>
                  <p className="text-2xl font-bold">{user.personal_credits}</p>
              </div>
              <div>
                  <p className="text-sm text-blue-100">用户状态</p>
                  <p className="text-lg font-semibold">{user.status}</p>
              </div>
           </div>
           {(user.is_admin === 1) && (
               <div className="mt-4 pt-2 border-t border-white/20">
                   <Link href="/dashboard/admin" className="text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 inline-block">
                       进入管理员后台
                   </Link>
               </div>
           )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/territories/create" className="block">
                <Card className="h-full flex flex-col items-center justify-center p-6 bg-blue-50 border-blue-100 hover:shadow-md transition-shadow">
                    <span className="text-4xl mb-2 text-blue-600">+</span>
                    <span className="font-medium text-blue-700">创建领地</span>
                </Card>
            </Link>
             <Link href="/dashboard/territories" className="block">
                <Card className="h-full flex flex-col items-center justify-center p-6 bg-green-50 border-green-100 hover:shadow-md transition-shadow">
                    <span className="text-2xl mb-2 text-green-600">Map</span>
                    <span className="font-medium text-green-700">我的领地</span>
                </Card>
            </Link>
        </div>

        {/* My Territories Preview */}
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">我的领地 ({totalTerritories}/10)</h3>
                <Link href="/dashboard/territories" className="text-sm text-blue-600">查看全部</Link>
            </div>
            {territories.length === 0 ? (
                <Card className="text-center py-8 text-gray-500">
                    您还没有加入任何领地
                </Card>
            ) : (
                <div className="space-y-3">
                    {territories.slice(0, 3).map(territory => ( // Show only top 3
                        <Link key={territory.id} href={`/dashboard/territories/${territory.id}`}>
                            <Card className="flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div>
                                    <h4 className="font-bold text-gray-800">{territory.name}</h4>
                                    <div className="flex space-x-2 mt-1">
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
      </div>
    </DashboardLayout>
  );
}
