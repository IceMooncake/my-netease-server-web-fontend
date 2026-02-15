'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, Button, Avatar, Typography, Tag } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { getStatusLabel, getStatusTagColor } from '@/lib/status-display';

const { Title, Text } = Typography;

export default function ProfilePage() {
    const { user, logout } = useAuth();

    return (
        <DashboardLayout title="个人中心">
            <Card variant={'borderless'} style={{ textAlign: 'center', marginBottom: 24, borderRadius: '16px' }}>
                 <Avatar size={80} style={{ backgroundColor: '#1890ff', marginBottom: 16 }} icon={<UserOutlined />} />
                 <Title level={3} style={{ marginBottom: 4 }}>{user?.nick_name || user?.qq}</Title>
                 <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>QQ: {user?.qq}</Text>
                  {user && user?.status !== 'ACTIVE' && <Tag color={getStatusTagColor(user.status)}>{getStatusLabel(user.status)}</Tag>}
            </Card>
            
            <div className="space-y-3">
                <Button type="primary" danger block size="large" icon={<LogoutOutlined />} onClick={logout}>退出登录</Button>
            </div>
        </DashboardLayout>
    );
}
