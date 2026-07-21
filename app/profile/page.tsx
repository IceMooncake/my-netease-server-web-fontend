'use client';

import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { trpcClient } from '@/lib/trpc/client';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, Button, Avatar, Typography, Tag, Form, Input, App, Spin, Alert, Modal } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { getStatusLabel, getStatusTagColor } from '@/lib/status-display';
import { useMemo } from 'react';

const { Title, Text } = Typography;

export default function ProfilePage() {
    const { message } = App.useApp();
    const { user, logout, refreshProfile } = useAuth();
    const [form] = Form.useForm();

    const updateMutation = useMutation({
        mutationFn: (nick_name: string) => trpcClient.user.updateNickname.mutate({ nick_name }),
        onSuccess: () => {
            message.success('昵称修改成功');
            refreshProfile();
            form.resetFields();
        },
    });

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
        const newNick = values.nick_name?.trim();
        const currentNick = user?.nick_name ?? '';
        if (!newNick) return;
        if (newNick === currentNick) {
            form.setFields([{ name: 'nick_name', errors: ['新昵称不能与旧昵称一致'] }]);
            return;
        }

        Modal.confirm({
            title: '确认修改昵称',
            content: <div><span style={{ textDecoration: 'line-through' }}>{currentNick}</span> → <span style={{ fontWeight: 'bold' }}>{newNick}</span></div>,
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                await updateMutation.mutateAsync(newNick);
            }
        });
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
                         <Button type="primary" htmlType="submit" loading={updateMutation.isPending} disabled={!canUpdateNickname} block>
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

