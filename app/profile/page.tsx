'use client';

import { useAuth } from '@/hooks/useAuth';
import { AuthenticationService } from '@/app/api';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, Button, Avatar, Typography, Tag, Form, Input, App, Spin, Alert } from 'antd';
import { UserOutlined, LogoutOutlined, EditOutlined } from '@ant-design/icons';
import { getStatusLabel, getStatusTagColor } from '@/lib/status-display';
import { useState, useMemo } from 'react';

const { Title, Text, Paragraph } = Typography;

export default function ProfilePage() {
    const { message } = App.useApp();
    const { user, logout, refreshProfile } = useAuth();
    const [updating, setUpdating] = useState(false);
    const [form] = Form.useForm();

    const canUpdateNickname = useMemo(() => {
        if (!user?.next_nickname_update_at) return true;
        const nextUpdate = new Date(user.next_nickname_update_at).getTime();
        return nextUpdate < Date.now();
    }, [user?.next_nickname_update_at]);

    const nextUpdateDate = useMemo(() => {
         if (!user?.next_nickname_update_at) return null;
         return new Date(user.next_nickname_update_at).toLocaleString();
    }, [user?.next_nickname_update_at]);

    const handleUpdateNickname = async (values: { nick_name: string }) => {
        try {
            setUpdating(true);
            await AuthenticationService.patchAuthMeNickname({ nick_name: values.nick_name });
            message.success('昵称修改成功');
            await refreshProfile();
            form.resetFields();
        } catch {
        } finally {
            setUpdating(false);
        }
    };

    if (!user) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;

    return (
        <DashboardLayout title="个人中心" showBack>
            <div className="space-y-4">
                <Card variant={'borderless'} style={{ textAlign: 'center', borderRadius: '16px', marginBottom: 24 }}>
                    <Avatar size={80} style={{ backgroundColor: '#1890ff', marginBottom: 16 }} icon={<UserOutlined />} />
                    <Title level={3} style={{ marginBottom: 4 }}>{user.nick_name || user.qq}</Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>QQ: {user.qq}</Text>
                    {user.status !== 'ACTIVE' && <Tag color={getStatusTagColor(user.status)}>{getStatusLabel(user.status)}</Tag>}
                </Card>

                <Card title="修改昵称" variant={'borderless'} style={{ borderRadius: '16px' }}>
                    {!canUpdateNickname && (
                         <Alert
                            message={`下次可修改时间: ${nextUpdateDate}`}
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                         />
                    )}
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdateNickname}
                        initialValues={{ nick_name: user.nick_name }}
                        disabled={!canUpdateNickname}
                    >
                         <Form.Item
                             name="nick_name"
                             label="新昵称"
                             rules={[
                                 { required: true, message: '请输入新昵称' },
                                 { min: 1, max: 20, message: '长度需在 1-20 字符之间' }
                             ]}
                         >
                             <Input placeholder="输入新昵称" allowClear showCount maxLength={20} />
                         </Form.Item>
                         <Button type="primary" htmlType="submit" loading={updating} disabled={!canUpdateNickname} block>
                             确认修改
                         </Button>
                         <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                             注意：昵称每 30 天仅允许修改一次。修改后请等待同步到游戏服务器。
                         </Text>
                    </Form>
                </Card>
                
                <Button type="primary" danger block size="large" icon={<LogoutOutlined />} onClick={logout} style={{ marginTop: 24 }}>
                    退出登录
                </Button>
            </div>
        </DashboardLayout>
    );
}

