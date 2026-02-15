'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TerritoryService, TerritoryListResponse, InvitationListResponse } from '@/app/api';
import Link from 'next/link';
import { Card, Avatar, Button, Row, Col, Spin, Flex, Typography, Tag, Space, Alert } from 'antd';
import { UserOutlined, SettingOutlined, PlusOutlined, AppstoreOutlined, RightOutlined } from '@ant-design/icons';
import { getStatusLabel, getStatusTagColor } from '@/lib/status-display';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [territories, setTerritories] = useState<TerritoryListResponse>([]);
  const [invitations, setInvitations] = useState<InvitationListResponse>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        try {
          const [myTerritories, myInvitations] = await Promise.all([
            TerritoryService.getTerritoriesMine(),
            TerritoryService.getTerritoriesInvitationsMine(),
          ]);
          setTerritories(myTerritories);
          setInvitations(myInvitations);
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

  const totalTerritories = territories.length;

  return (
    <DashboardLayout title="概览">
      <div className="space-y-6">
        {invitations.length > 0 && (
          <Alert
            title={`您有 ${invitations.length} 个待处理的领地邀请`}
            type="info"
            showIcon
            style={{ borderRadius: 12, border: '1px solid #91caff', backgroundColor: '#e6f7ff', marginBottom: 12 }}
            action={
              <Link href="/dashboard/invitations">
                <Button size="small" type="primary">查看详情</Button>
              </Link>
            }
          />
        )}
        <Card
          variant={'borderless'}
          style={{
            background: 'linear-gradient(135deg, rgba(191,225,255,0.85) 0%, rgba(156,206,255,0.78) 100%)',
            color: '#17345c',
            borderRadius: '16px',
            boxShadow: '0 8px 22px rgba(102, 171, 238, 0.26)',
            border: '1px solid rgba(122, 186, 248, 0.35)',
            marginBottom: 24,
          }}
        >
          <Flex align="center" gap={16}>
            <Avatar size={64} style={{ backgroundColor: 'rgba(69, 145, 224, 0.16)', color: '#1d4c85' }} icon={<UserOutlined />} />
            <div>
              <Title level={4} style={{ color: '#17345c', margin: 0 }}>{user.nick_name || user.qq}</Title>
              <Text style={{ color: '#27538a' }}>QQ: {user.qq}</Text>
            </div>
          </Flex>

          <Row gutter={16} className="mt-4 pt-4 border-t border-blue-200/70">
            <Col span={12}>
              <Text style={{ color: '#2b5d9a', fontSize: '12px' }}>个人方块额度</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{user.personal_credits}</div>
            </Col>
            {user.status !== 'ACTIVE' ? (
              <Col span={12}>
                <Text style={{ color: '#2b5d9a', fontSize: '12px' }}>用户状态</Text>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{getStatusLabel(user.status)}</div>
              </Col>
            ) : (
              <Col span={12}>
                <Text style={{ color: '#2b5d9a', fontSize: '12px' }}>领地数量(上限10)</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalTerritories}</div>
              </Col>
            )}
          </Row>

          {user.is_admin === 1 && (
            <div className="mt-4 pt-2 border-t border-blue-200/70 text-right">
              <Link href="/dashboard/admin">
                <Button ghost size="small" icon={<SettingOutlined />}>管理员后台</Button>
              </Link>
            </div>
          )}
        </Card>

        <Row gutter={16}>
          <Col span={12}>
            <Link href="/dashboard/territories/create">
              <Card hoverable className="text-center h-full" style={{ borderRadius: '12px' }}>
                <Flex vertical align="center" justify="center" gap={8}>
                  <PlusOutlined style={{ fontSize: '28px', color: '#1890ff' }} />
                  <Text strong>创建领地</Text>
                </Flex>
              </Card>
            </Link>
          </Col>
          <Col span={12}>
            <Link href="/dashboard/territories">
              <Card hoverable className="text-center h-full" style={{ borderRadius: '12px' }}>
                <Flex vertical align="center" justify="center" gap={8}>
                  <AppstoreOutlined style={{ fontSize: '28px', color: '#52c41a' }} />
                  <Text strong>我的领地</Text>
                </Flex>
              </Card>
            </Link>
          </Col>
        </Row>

        <Card title={<Space><AppstoreOutlined /><span>近期更新领地</span></Space>} variant={'borderless'} style={{ borderRadius: 16 }}>
             <Flex vertical>
                 {territories
                     .slice()
                     .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
                     .slice(0, 3)
                     .map((item, index, arr) => (
                         <div
                             key={item.id}
                             style={{
                                 display: 'flex',
                                 justifyContent: 'space-between',
                                 alignItems: 'center',
                                 padding: '12px 0',
                                 borderBottom: index < arr.length - 1 ? '1px solid #f0f0f0' : 'none'
                             }}
                         >
                             <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                                     <Text strong style={{ fontSize: 16, marginBottom: 4 }}>{item.name}</Text>
                                     <Space size={4} wrap>
                                         <Tag color={getStatusTagColor(item.status)}>{item.area === 0 ? '领地待确定范围' : getStatusLabel(item.status)}</Tag>
                                     </Space>
                                 </div>
                             </div>

                             <Flex gap={16} align="center">
                                 <div style={{ textAlign: 'right', minWidth: 60 }}>
                                     <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>面积</Text>
                                     <div style={{ fontWeight: 600 }}>{item.area}</div>
                                 </div>
                                 <Link href={`/dashboard/territories/${item.id}`}>
                                     <Button size="small" type="link">查看 <RightOutlined /></Button>
                                 </Link>
                             </Flex>
                         </div>
                     ))}
                 {territories.length === 0 && (
                     <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>暂无领地数据</div>
                 )}
             </Flex>
        </Card>

      </div>
    </DashboardLayout>
  );
}
