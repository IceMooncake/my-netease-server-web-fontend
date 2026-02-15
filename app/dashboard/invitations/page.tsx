'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TerritoryService, InvitationResponse } from '@/app/api';
import { Button, Card, Typography, Space, Modal, Empty, Spin, Flex, App } from 'antd';
import { CheckOutlined, CloseOutlined, TeamOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

export default function InvitationsPage() {
  const { message, modal } = App.useApp();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const loadInvitations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TerritoryService.getTerritoriesInvitationsMine();
      setInvitations(data);
    } catch (e) {
      console.error(e);
      message.error('加载邀请列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadInvitations();
    }
  }, [isAuthenticated, loadInvitations]);

  const handleAccept = async (id: string, territoryName: string) => {
    try {
        setActionLoading(id);
        await TerritoryService.postTerritoriesInvitationsAccept(id);
        message.success(`已加入领地: ${territoryName}`);
        await loadInvitations(); // Refresh list
    } catch (e: unknown) {
        if (e instanceof Error) {
             message.error(`加入失败: ${e.message}`);
        } else {
             message.error('加入失败');
        }
    } finally {
        setActionLoading(null);
    }
  };

  const handleReject = async (id: string, territoryName: string) => {
      modal.confirm({
          title: '拒绝邀请',
          content: `确定要拒绝加入领地 "${territoryName}" 吗？`,
          okText: '确认拒绝',
          cancelText: '取消',
          okButtonProps: { danger: true },
          onOk: async () => {
              try {
                  // Using a different state or just handling it here since modal blocks
                  // But to update UI loading state on the button behind consistent with accept:
                  setActionLoading(id);
                  await TerritoryService.deleteTerritoriesInvitations(id);
                  message.success('已拒绝邀请');
                  await loadInvitations();
              } catch (e: unknown) {
                if (e instanceof Error) {
                     message.error(`操作失败: ${e.message}`);
                } else {
                     message.error('操作失败');
                }
              } finally {
                  setActionLoading(null);
              }
          }
      });
  };

  if (isAuthLoading || !user) {
    return (
        <DashboardLayout title="领地邀请" showBack>
            <Flex justify="center" align="center" style={{ height: '80vh' }}>
                <Spin size="large" />
            </Flex>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="领地邀请" showBack>
      <div className="space-y-4">
        <Card
            variant={'borderless'}
            style={{
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
            }}
        >
            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <div>
                    <Title level={4} style={{ margin: 0, color: '#173f6f' }}>待处理邀请</Title>
                    <Text type="secondary">您收到的领地加入邀请</Text>
                </div>
                <Button type="default" onClick={loadInvitations} loading={loading}>刷新</Button>
            </Flex>

            {loading ? (
                <Flex justify="center" style={{ padding: 40 }}>
                    <Spin />
                </Flex>
            ) : invitations.length === 0 ? (
                <Empty description="暂无待处理的邀请" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
                <Flex vertical>
                    {invitations.map((item, index, arr) => (
                        <div
                            key={item.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px 0',
                                borderBottom: index < arr.length - 1 ? '1px solid #f0f0f0' : 'none'
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: '#e6f7ff',
                                        color: '#1890ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 20,
                                        flexShrink: 0
                                    }}>
                                        <TeamOutlined />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                                            {item.territory_name}
                                        </Text>
                                        <Space orientation="vertical" size={2}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {new Date(item.created_at).toLocaleString()}
                                            </Text>
                                        </Space>
                                    </div>
                                </div>
                            </div>

                            <Flex gap={8} align="center" className="flex-col">
                                <Button
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    loading={actionLoading === item.id}
                                    onClick={() => handleAccept(item.id, item.territory_name)}
                                >
                                    接受
                                </Button>
                                <Button
                                    danger
                                    type="text"
                                    icon={<CloseOutlined />}
                                    disabled={actionLoading === item.id}
                                    onClick={() => handleReject(item.id, item.territory_name)}
                                >
                                    拒绝
                                </Button>
                            </Flex>
                        </div>
                    ))}
                </Flex>
            )}
        </Card>
      </div>
    </DashboardLayout>
  );
}