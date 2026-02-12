'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCallback, useEffect, useState } from 'react';
import { VoteService, VoteListResponse } from '@/app/api';

export default function VotesPage() {
    const { isAuthenticated } = useAuth();
    const [votes, setVotes] = useState<VoteListResponse>([]);
    const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'>('PENDING');

    // 提取加载逻辑，避免在 useEffect 中直接调用可能导致依赖循环或同步 setState 警告的函数
    const loadVotes = useCallback(async (status: typeof filter) => {
        try {
            return await VoteService.getVotes({ status });
        } catch (error) {
            console.error(error);
            return [];
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        if (isAuthenticated) {
            loadVotes(filter).then(data => {
                if (mounted) setVotes(data);
            });
        }
        return () => { mounted = false; };
    }, [isAuthenticated, filter, loadVotes]);

    const handleVote = async (voteId: string, decision: boolean) => {
        try {
            await VoteService.postVotesCast({ voteId, decision });
            alert('投票成功');
            // 手动刷新
            const data = await loadVotes(filter);
            setVotes(data);
        } catch (e: unknown) {
            alert('投票失败: ' + ((e as Error).message || '未知错误'));
        }
    };

    return (
        <DashboardLayout title="投票中心">
             <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status as "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED")}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                            filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 border'
                        }`}
                    >
                        {status === 'PENDING' ? '待处理' : status === 'APPROVED' ? '已通过' : '已拒绝'}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                 {votes.length === 0 ? (
                     <div className="text-center text-gray-500 py-10">
                         暂无{filter}的投票
                     </div>
                 ) : (
                     votes.map(vote => (
                         <Card key={vote.id}>
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                     <h3 className="font-bold text-gray-800">{vote.title || '未命名投票'}</h3>
                                     <p className="text-xs text-gray-500">
                                         类型: {vote.type} | 发起人: {vote.creator_qq}
                                     </p>
                                     <p className="text-xs text-gray-500">截止: {vote.deadline}</p>
                                 </div>
                                 <Badge variant={vote.status === 'PENDING' ? 'warning' : 'default'}>{vote.status}</Badge>
                             </div>
                             
                             <div className="bg-gray-50 p-2 rounded text-sm mb-3">
                                 <div className="flex justify-between mb-1">
                                     <span className="text-green-600">同意: {vote.yes_votes}</span>
                                     <span className="text-red-600">反对: {vote.no_votes}</span>
                                 </div>
                                 {/* Progress bar could go here */}
                             </div>

                             {filter === 'PENDING' && (
                                 <div className="flex gap-2">
                                     <Button 
                                        className="flex-1 bg-green-600 hover:bg-green-700 font-bold" 
                                        onClick={() => handleVote(vote.id, true)}
                                     >
                                         同意
                                     </Button>
                                     <Button 
                                        className="flex-1 bg-red-600 hover:bg-red-700 font-bold" 
                                        onClick={() => handleVote(vote.id, false)}
                                     >
                                         拒绝
                                     </Button>
                                 </div>
                             )}
                         </Card>
                     ))
                 )}
            </div>
        </DashboardLayout>
    );
}
