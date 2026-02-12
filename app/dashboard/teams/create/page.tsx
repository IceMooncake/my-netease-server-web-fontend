'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { TeamService } from '@/app/api';
import { useRouter } from 'next/navigation';

export default function CreateTeamPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await TeamService.postTeamsCreate({ name });
            router.push('/dashboard/teams');
        } catch (error: unknown) {
             alert('创建失败: ' + ((error as Error).message || '未知错误'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <DashboardLayout title="创建团队" showBack>
            <div className="max-w-md mx-auto mt-6">
                <Card>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-4">
                                创建团队后，您将成为领地主。每个人最多只能创建一个团队。
                            </p>
                        </div>
                        <Input 
                            label="团队名称" 
                            required 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="给您的团队起个响亮的名字"
                        />
                        <div className="pt-4">
                            <Button fullWidth type="submit" isLoading={loading}>
                                创建团队
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
