'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TerritoryService, TerritoryListResponse } from '@/app/api';
import Link from 'next/link';
import { Card, Tag, Button, Spin, Empty, Flex, Typography, Space } from 'antd';
import { PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { getStatusLabel, getStatusTagColor } from '@/lib/status-display';

const { Title, Text } = Typography;

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
    return <Flex justify="center" align="center" style={{ height: '100vh' }}><Spin size="large" /></Flex>;
  }

  return (
    <DashboardLayout title="我的领地">
      <div className="space-y-4">
        <Flex justify="space-between" align="center" style={{marginBottom: 24}}>
             <Text type="secondary">已加入 {territories.length} 个领地</Text>
             <Link href="/dashboard/territories/create">
                <Button type="primary" icon={<PlusOutlined />} size="small">创建新领地</Button>
             </Link>
        </Flex>

        {territories.length === 0 ? (
             <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="您还没有加入任何领地"
             >
                 <Link href="/dashboard/territories/create">
                    <Button type="primary">立即创建</Button>
                 </Link>
             </Empty>
        ) : (
            <Space orientation="vertical" size={16} style={{ width: '100%' }}>
              {territories.map((territory) => (
                <Link key={territory.id} href={`/dashboard/territories/view?id=${territory.id}`}>
                  <Card hoverable style={{ borderRadius: '12px' }}>
                    <Flex justify="space-between" align="center">
                      <div>
                        <Title level={5} style={{ margin: 0 }}>{territory.name}</Title>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {territory.area !== 0 && <Tag icon={<EnvironmentOutlined />}>({territory.x1}, {territory.z1})</Tag>}
                          <Tag>可用额度: {territory.credits}</Tag>
                          <Tag color={getStatusTagColor(territory.status)}>
                            {territory.area === 0 ? '领地待确定范围' : getStatusLabel(territory.status)}
                          </Tag>
                        </div>
                      </div>
                      <div className="text-right">
                        <div style={{ color: '#1890ff', fontSize: '16px', fontWeight: 'bold' }}>{territory.area !== 0 && `面积 ${territory.area}`}</div>
                        <Tag color={territory.owner_id === user.qq ? 'gold' : 'blue'} className="mt-2 mr-0">
                          {territory.owner_id === user.qq ? '领地主' : '成员'}
                        </Tag>
                      </div>
                    </Flex>
                  </Card>
                </Link>
              ))}
            </Space>
        )}
      </div>
    </DashboardLayout>
  );
}
