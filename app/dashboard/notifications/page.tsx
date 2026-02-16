'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationService, NotificationListResponse } from '@/app/api';
import { Button, Card, Typography, Empty, Spin, Flex, App } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

export default function NotificationsPage() {
  const { message } = App.useApp();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationListResponse>([]);
  const [loading, setLoading] = useState(true);
  const [readingId, setReadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getNotifications();
      setNotifications(data);
    } catch (e: unknown) {
      console.error(e);
      message.error('加载通知列表失败');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, loadNotifications]);

  const handleRead = async (id: string) => {
    try {
      setReadingId(id);
      await NotificationService.putNotificationsRead(id);
      message.success('已标记为已读');
      // Optimistically remove from list or reload
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Optionally reload to be sure
      // await loadNotifications();
    } catch (e: unknown) {
       console.error(e);
       message.error('操作失败');
    } finally {
      setReadingId(null);
    }
  };

  const handleReadAll = async () => {
      // If there was an API for read all, we would use it.
      // Since there isn't one evident, we can loop or just ask user to do one by one.
      // Or maybe the user meant "mark read" individually.
      // For now, I'll stick to individual actions as per API capabilities shown.
      // If I want to implement read all, I'd have to promise.all all unread.
      if (notifications.length === 0) return;
      
      try {
          setLoading(true);
          await Promise.all(notifications.map(n => NotificationService.putNotificationsRead(n.id)));
          message.success('全部已读');
          setNotifications([]);
      } catch {
          message.error('部分标记失败');
          loadNotifications();
      } finally {
          setLoading(false);
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
              {notifications.map((notification) => (
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
                            loading={readingId === notification.id}
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
