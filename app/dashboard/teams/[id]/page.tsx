'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useEffect, useState } from 'react';
import { TeamService, TeamDetailResponse, TerritoryService, CreditService } from '@/app/api';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';

// Helper to access params.id properly in Next.js 13+ client components if using pages router pattern, 
// but in App Router [id]/page.tsx receives params as props.
// However, Page props are async in latest Next.js versions often, but usually passed as props.
// Let's use `extends` for props.

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useAuth();
    const router = useRouter();
    const [, setId] = useState<string>('');
    const [team, setTeam] = useState<TeamDetailResponse | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'territories' | 'danger'>('overview');
    
    // Operations state
    const [contributionAmount, setContributionAmount] = useState('');

    const loadTeam = async (teamId: string) => {
        try {
            const data = await TeamService.getTeams({ teamId });
            setTeam(data);
        } catch (error) {
            console.error('Failed to load team', error);
            // alert('加载团队失败');
        }
    };

    useEffect(() => {
        params.then(p => {
             setId(p.id);
             loadTeam(p.id);
        });
    }, [params]);

    const handleContribute = async () => {
        if (!team) return;
        try {
            const amount = parseInt(contributionAmount);
            if (isNaN(amount) || amount <= 0) return alert('请输入有效的数量');
            
            await CreditService.postCreditsContribute({
                teamId: team.id,
                amount: amount
            });
            alert('贡献成功！');
            setContributionAmount('');
            loadTeam(team.id); 
            // Also refresh user profile to show deducted credits?
            window.location.reload(); // Simple reload to refresh all data including user balance
        } catch (e) {
            alert('贡献失败: ' + (e as Error).message);
        }
    };

    const handleLeave = async () => {
        if (!team || !confirm('确定要退出该团队吗？')) return;
        try {
            await TeamService.postTeamsLeave({ teamId: team.id });
            router.push('/dashboard/teams');
        } catch(e) {
            alert((e as Error).message);
        }
    }

    if (!team) return <DashboardLayout title="加载中..."><div className="p-4">Loading...</div></DashboardLayout>;

    const isOwner = user?.qq === team.owner_id;

    return (
        <DashboardLayout title={team.name} showBack>
            <div className="flex space-x-1 mb-4 overflow-x-auto pb-2">
                {[
                    { id: 'overview', label: '概览' },
                    { id: 'members', label: '成员' },
                    { id: 'territories', label: '领地' },
                    { id: 'danger', label: '设置' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as "overview" | "members" | "territories" | "danger")}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {activeTab === 'overview' && (
                    <>
                        <Card title="团队信息">
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500 text-xs">团队ID</p>
                                    <p className="font-mono text-sm break-all">{team.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">领地主</p>
                                    <p className="text-sm break-all">{team.owner_id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">团队额度</p>
                                    <p className="text-xl font-bold text-blue-600">{team.team_credits}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">成员数</p>
                                    <p>{team.members.length}</p>
                                </div>
                             </div>
                        </Card>

                        <Card title="贡献额度">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    将您的个人额度贡献给团队，用于圈地。
                                    <span className="text-red-500">注意：该操作不可逆！</span>
                                </p>
                                <div className="flex gap-2">
                                    <Input 
                                        type="number" 
                                        placeholder="数量" 
                                        value={contributionAmount}
                                        onChange={e => setContributionAmount(e.target.value)}
                                    />
                                    <Button onClick={handleContribute}>贡献</Button>
                                </div>
                            </div>
                        </Card>
                    </>
                )}

                {activeTab === 'members' && (
                    <div className="space-y-2">
                        {team.members.map(member => (
                            <Card key={member.qq} className="flex justify-between items-center py-3">
                                <div>
                                    <div className="font-bold">{member.qq}</div>
                                    <div className="text-xs text-gray-500">加入时间: {member.joined_at}</div>
                                </div>
                                {member.qq === team.owner_id && <Badge variant="warning">领地主</Badge>}
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'territories' && (
                    <div className="space-y-4">
                        {isOwner && (
                            <Card className="mb-4 bg-blue-50 border-blue-100">
                                 <h4 className="font-bold mb-2 text-blue-800">发起圈地提案</h4> 
                                 <form onSubmit={async (e) => {
                                     e.preventDefault();
                                     const form = e.target as HTMLFormElement;
                                     const formData = new FormData(form);
                                     try {
                                         await TerritoryService.postTerritoriesCreate({
                                             teamId: team.id,
                                             name: formData.get('name') as string,
                                             x1: Number(formData.get('x1')),
                                             z1: Number(formData.get('z1')),
                                             x2: Number(formData.get('x2')),
                                             z2: Number(formData.get('z2')),
                                             type: formData.get('type') as 'NO_ENTRY' | 'NO_BREAK'
                                         });
                                         alert('提案已提交，请等待管理员审核');
                                         form.reset();
                                     } catch (err) {
                                         alert('提交失败: ' + (err as Error).message);
                                     }
                                 }} className="space-y-3">
                                     <div>
                                         <label className="text-xs text-gray-600">领地名称</label>
                                         <Input name="name" required placeholder="领地名称" />
                                     </div>
                                     <div className="grid grid-cols-2 gap-2">
                                         <div>
                                             <label className="text-xs text-gray-600">X1</label>
                                             <Input name="x1" type="number" required placeholder="X1" />
                                         </div>
                                         <div>
                                             <label className="text-xs text-gray-600">Z1</label>
                                             <Input name="z1" type="number" required placeholder="Z1" />
                                         </div>
                                         <div>
                                             <label className="text-xs text-gray-600">X2</label>
                                             <Input name="x2" type="number" required placeholder="X2" />
                                         </div>
                                         <div>
                                             <label className="text-xs text-gray-600">Z2</label>
                                             <Input name="z2" type="number" required placeholder="Z2" />
                                         </div>
                                     </div>
                                     <div>
                                         <label className="text-xs text-gray-600">类型</label>
                                         <select name="type" className="w-full border rounded p-2 text-sm bg-white" required>
                                             <option value="NO_ENTRY">禁止进入 (NO_ENTRY)</option>
                                             <option value="NO_BREAK">禁止破坏 (NO_BREAK)</option>
                                         </select>
                                     </div>
                                     <Button type="submit" fullWidth>提交提案</Button>
                                 </form>
                            </Card>
                        )}
                        
                        <h3 className="font-bold text-gray-700">现有领地</h3>
                        {team.territories.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">暂无领地</div>
                        ) : (
                            team.territories.map(t => (
                                <Card key={t.id}>
                                    <div className="flex justify-between">
                                        <div className="font-bold text-lg">{t.name}</div>
                                        <Badge variant={t.status === 'ACTIVE' ? 'success' : 'default'}>{t.status}</Badge>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        面积: {t.area} | ID: {t.id}
                                    </div>
                                    {isOwner && (
                                        <div className="mt-3 flex justify-end">
                                            <Button  variant="danger" onClick={async () => {
                                                if (confirm('确定要发起删除该领地的提案吗？')) {
                                                    try {
                                                        await TerritoryService.postTerritoriesDelete({ territoryId: t.id });
                                                        alert('提案已发起');
                                                    } catch(e) {
                                                        alert((e as Error).message);
                                                    }
                                                }
                                            }}>删除提案</Button>
                                        </div>
                                    )}
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'danger' && (
                     <div className="space-y-4">
                        <Card title="危险区域">
                            <div className="space-y-4">
                                <Button variant="danger" fullWidth onClick={handleLeave}>退出团队</Button>
                                {isOwner && (
                                    <p className="text-xs text-red-500 mt-2">
                                        目前暂不提供解散团队的直接按钮，请踢出所有成员后，最后退出即可自动解散(需符合业务逻辑)。
                                    </p>
                                )}
                            </div>
                        </Card>
                     </div>
                )}
            </div>
        </DashboardLayout>
    );
}
