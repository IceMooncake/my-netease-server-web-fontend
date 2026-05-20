'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useCallback, useEffect, useState } from 'react';
import { AdminTaskResponse, AdminService } from '@/app/api';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Tag, Tabs, Spin, message, Typography, Descriptions, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getAdminTaskTypeLabel, getAdminTaskTypeTagColor, getStatusLabel, getStatusTagColor } from '@/lib/status-display';

const { Paragraph } = Typography;

type AdminFilter = 'PENDING' | 'DONE' | 'IGNORED' | 'REJECTED'

export default function AdminPage() {
    const { isAuthenticated, user, isLoading } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<AdminTaskResponse[]>([]);
    const [filter, setFilter] = useState<AdminFilter>('PENDING');
    const [loadingTasks, setLoadingTasks] = useState(false);

    const tabItems = [
        { key: 'PENDING', label: '待处理' },
        { key: 'DONE', label: '已完成' },
        { key: 'REJECTED', label: '已拒绝' },
        { key: 'IGNORED', label: '已忽略' },
    ].map(({ key, label }) => ({
        key,
        label: filter === key ? <Badge count={tasks.length} offset={[10, 0]}>{label}</Badge> : label,
    }));

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.is_admin !== 1) {
                router.push('/dashboard');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    const loadTasks = useCallback(async (status: AdminFilter) => {
        setLoadingTasks(true);
        try {
            const data = await AdminService.getAdminTasks({ status });
            return data;
        } catch (e) {
            console.error(e);
            return [];
        } finally {
            setLoadingTasks(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        if (user?.is_admin === 1) {
            loadTasks(filter).then(data => {
                if (mounted) setTasks(data);
            });
        }
        return () => { mounted = false; };
    }, [user, filter, loadTasks]);

    const handleProcess = async (taskId: string, approved: boolean) => {
        let processMessage = '';
        if (!approved) {
             const reason = prompt('请输入拒绝理由(必填)');
             if (reason === null) return; // Cancelled
             if (!reason.trim()) {
                 message.warning('拒绝理由不能为空');
                 return;
             }
             processMessage = reason;
        } else {
             const memo = prompt('请输入通过备注(可选)');
             if (memo === null) return;
             processMessage = memo || '';
        }

        try {
            await AdminService.postAdminProcess({
                taskId,
                approved,
                message: processMessage
            });
            message.success('操作成功');
            // Manual refresh
            const data = await loadTasks(filter);
            setTasks(data);
        } catch {
        }
    };

    if (isLoading || !user || user.is_admin !== 1) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;

    const renderTask = (task: AdminTaskResponse) => (
        <Card 
            key={task.id} 
            className="mb-4" 
            hoverable
            title={<Space><Tag color={getAdminTaskTypeTagColor(task.type)}>{getAdminTaskTypeLabel(task.type)}</Tag><span style={{ fontSize: 14, color: '#999' }}>#{task.id}</span></Space>}
            extra={<Tag color={getStatusTagColor(task.status)}>{getStatusLabel(task.status)}</Tag>}
            actions={task.status === 'PENDING' ? [
                <Button key="approve" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleProcess(task.id, true)}>通过</Button>,
                <Button key="reject" danger icon={<CloseCircleOutlined />} onClick={() => handleProcess(task.id, false)}>拒绝</Button>
            ] : []}
        >
            <Descriptions column={1} size="small">
                <Descriptions.Item label="提交时间">{task.created_at}</Descriptions.Item>
                <Descriptions.Item label="详细数据">
                     <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: '展开' }} code>
                        {JSON.stringify(task.payload, null, 2)}
                     </Paragraph>
                </Descriptions.Item>
                {task.processed_by && (
                    <>
                        <Descriptions.Item label="处理人">{task.processed_by}</Descriptions.Item>
                        <Descriptions.Item label="处理时间">{task.processed_at}</Descriptions.Item>
                    </>
                )}
            </Descriptions>
        </Card>
    );

    return (
        <DashboardLayout title="管理员控制台" showBack>
            <Tabs 
                activeKey={filter}
                onChange={(key) => setFilter(key as AdminFilter)}
                items={tabItems}
            />

            <div className="mt-4">
                {loadingTasks ? (
                    <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
                ) : (
                    tasks.length === 0 ? <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>暂无任务</div> :
                    tasks.map(renderTask)
                )}
            </div>
        </DashboardLayout>
    );
}
