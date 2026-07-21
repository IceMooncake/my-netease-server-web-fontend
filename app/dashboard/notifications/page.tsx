'use client';

import { useAuth, useUnreadNotifications, useMarkRead } from '@/hooks';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Typography, Empty, Spin, Flex, App } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

export default function NotificationsPage() {
  const { message } = App.useApp();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const { data: notifications = [], isLoading: loading, refetch } = useUnreadNotifications();
  const markReadMutation = useMarkRead();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const handleRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id);
      message.success('已标记为已读');
    } catch {
      message.error('操作失败');
    }
  };

  const handleReadAll = async () => {
    if (notifications.length === 0) return;
    try {
      await Promise.all(notifications.map((n: typeof notifications[number]) => markReadMutation.mutateAsync(n.id)));
      message.success('全部已读');
    } catch {
      message.error('部分标记失败');
      refetch();
    }
  };

  if (isAuthLoading || !user) {
    return (
        <DashboardLayout title="消息通知" showBack>
            <Flex justify="center" align="center" style={{ height: '80vh' }}>
                <Spin size="large" />
            </Flex>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="消息通知" showBack>
      <div className="space-y-4">
        <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
             <Text type="secondary">您有 {notifications.length} 条未读消息</Text>
             {notifications.length > 0 && (
                 <Button onClick={handleReadAll} disabled={loading} size="small">全部已读</Button>
             )}
        </Flex>

        {loading ? (
             <Flex justify="center" align="center" style={{ minHeight: 200 }}>
                 <Spin />
             </Flex>
        ) : notifications.length === 0 ? (
             <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无未读消息"
             />
        ) : (
            <div className="space-y-4">
              {notifications.map((notification: typeof notifications[number]) => (
                <Card 
                    key={notification.id} 
                    hoverable 
                    style={{ borderRadius: '12px', borderLeft: '4px solid #1890ff' }}
                    actions={[
                        <Button 
                            key="read" 
                            type="text" 
                            icon={<CheckOutlined />} 
                            onClick={() => handleRead(notification.id)}
                            loading={markReadMutation.isPending}
                            block
                        >
                            标记已读
                        </Button>
                    ]}
                >
                    <Flex gap={16} align="start">
                        <BellOutlined style={{ fontSize: 24, color: '#1890ff', marginTop: 4 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>{notification.created_at}</Text>
                                <Text type="danger" style={{ fontSize: 12 }}>未读</Text>
                            </div>
                            <Paragraph style={{ marginBottom: 0, fontSize: 15 }}>
                                {notification.content}
                            </Paragraph>
                        </div>
                    </Flex>
                </Card>
              ))}
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}
