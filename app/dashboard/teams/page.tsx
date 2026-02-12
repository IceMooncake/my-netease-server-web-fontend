'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { TeamService, MyTeamsResponse } from '@/app/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TeamsPage() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const [teams, setTeams] = useState<MyTeamsResponse>([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    const fetchTeams = async () => {
        try {
            setLoadingTeams(true);
            const data = await TeamService.getTeamsMine();
            setTeams(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingTeams(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchTeams();
        }
    }, [isAuthenticated]);


    return (
        <DashboardLayout title="团队列表" 
            actions={
                <Link href="/dashboard/teams/create">
                   <Button variant="primary">创建团队</Button>
                </Link>
            }
        >
            <div className="space-y-4">
                {loadingTeams ? (
                    <div>加载中...</div>
                ) : teams.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 mb-4">您还没有加入任何团队</p>
                        <div className="space-x-4">
                            <Link href="/dashboard/teams/create">
                                <Button>创建团队</Button>
                            </Link>
                            {/* <Button variant="secondary">加入团队</Button>  TODO: Add join flow */}
                        </div>
                    </div>
                ) : (
                    teams.map(team => (
                        <Link key={team.id} href={`/dashboard/teams/${team.id}`}>
                            <Card className="hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-lg font-bold text-gray-800">{team.name}</h3>
                                            {team.owner_id === user?.qq && <Badge variant="warning">领地主</Badge>}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">ID: {team.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-blue-600 text-lg">{team.team_credits}</div>
                                        <div className="text-xs text-gray-500">可用额度</div>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between text-sm text-gray-600 border-t pt-2">
                                    <span>成员: {team.members_count}</span>
                                    <span>领地: {team.territories_count}</span>
                                </div>
                            </Card>
                        </Link>
                    ))
                )}
                
                <div className="mt-8 border-t pt-6">
                    <h3 className="font-bold mb-4">加入团队</h3>
                    <Card>
                        <form className="flex gap-2" onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const input = form.elements.namedItem('teamId') as HTMLInputElement;
                            if(input.value) {
                                try {
                                    await TeamService.postTeamsJoin({ teamId: input.value });
                                    alert('加入成功');
                                    fetchTeams();
                                    input.value = '';
                                } catch(err: unknown) {
                                    alert('加入失败: ' + (err as Error).message);
                                }
                            }
                        }}>
                            <input 
                                name="teamId"
                                type="text" 
                                placeholder="输入团队ID加入" 
                                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                            />
                            <Button type="submit">加入</Button>
                        </form>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
