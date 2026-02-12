'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCallback, useEffect, useState } from 'react';
import { AdminTaskResponse, AdminService } from '@/app/api';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const { isAuthenticated, user, isLoading } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<AdminTaskResponse[]>([]);
    const [filter, setFilter] = useState<'PENDING' | 'DONE' | 'IGNORED' | 'REJECTED'>('PENDING');

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.is_admin !== 1) {
                alert('无权限');
                router.push('/dashboard');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    const loadTasks = useCallback(async (status: typeof filter) => {
        try {
            return await AdminService.getAdminTasks({ status });
        } catch (e) {
            console.error(e);
            return [];
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
        const message = prompt(approved ? '请输入通过备注(可选)' : '请输入拒绝理由(必填)');
        if (approved === false && !message) return; // Request message for rejection

        try {
            await AdminService.postAdminProcess({
                taskId,
                approved,
                message: message || ''
            });
            alert('操作成功');
            // Manual refresh
            const data = await loadTasks(filter);
            setTasks(data);
        } catch (e) {
            alert('操作失败: ' + (e as Error).message);
        }
    };

    if (isLoading || !user || user.is_admin !== 1) return <div>Checking perms...</div>;

    return (
        <DashboardLayout title="管理员控制台" showBack>
             <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                {['PENDING', 'DONE', 'REJECTED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status as 'PENDING' | 'DONE' | 'IGNORED' | 'REJECTED')}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                            filter === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {tasks.map(task => (
                    <Card key={task.id}>
                        <div className="flex justify-between">
                            <h4 className="font-bold">{task.type}</h4>
                            <Badge>{task.status}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 my-2">
                            ID: {task.id} | Date: {task.created_at}
                        </div>
                        <div className="bg-gray-50 p-2 text-xs font-mono overflow-auto max-h-32 mb-3">
                            {JSON.stringify(task.payload, null, 2)}
                        </div>
                        
                        {task.status === 'PENDING' && (
                            <div className="flex gap-2">
                                <Button 
                                    className="flex-1 bg-green-600" 
                                    onClick={() => handleProcess(task.id, true)}
                                >
                                    通过
                                </Button>
                                <Button 
                                    className="flex-1 bg-red-600" 
                                    onClick={() => handleProcess(task.id, false)}
                                >
                                    拒绝
                                </Button>
                            </div>
                        )}
                        {task.processed_by && (
                            <div className="text-xs text-gray-400 mt-2 text-right">
                                处理人: {task.processed_by} At: {task.processed_at}
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    );
}
