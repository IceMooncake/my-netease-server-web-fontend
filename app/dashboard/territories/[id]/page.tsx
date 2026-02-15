'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TerritoryService, TerritoryResponse } from '@/app/api';

export default function TerritoryDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [territory, setTerritory] = useState<TerritoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Action states
  const [donateAmount, setDonateAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  
  const [inviteQQ, setInviteQQ] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const [locForm, setLocForm] = useState({ x1: 0, z1: 0, x2: 0, z2: 0 });
  const [isUpdatingLoc, setIsUpdatingLoc] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const loadTerritory = async () => {
    try {
      setLoading(true);
      // Since there is no getById, we fetch all and find
      const list = await TerritoryService.getTerritoriesMine();
      const found = list.find(t => t.id === id);
      if (found) {
        setTerritory(found);
        setLocForm({ x1: found.x1, z1: found.z1, x2: found.x2, z2: found.z2 });
      } else {
        setError('Territory not found');
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
          setError(e.message || 'Failed to load territory');
      } else {
          setError('Failed to load territory: Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
        loadTerritory();
    }
  }, [isAuthenticated, id]);

  const handleDonate = async () => {
      try {
          setIsDonating(true);
          await TerritoryService.postTerritoriesDonate(id, { amount: Number(donateAmount) });
          setDonateAmount('');
          alert('捐赠成功');
          loadTerritory();
      } catch (e: unknown) {
        if (e instanceof Error) {
            alert('捐赠失败: ' + e.message);
        } else {
            alert('捐赠失败: 发生未知错误');
        }
      } finally {
          setIsDonating(false);
      }
  };

  const handleInvite = async () => {
      try {
          setIsInviting(true);
          await TerritoryService.postTerritoriesInvite(id, { qq: inviteQQ });
          setInviteQQ('');
          alert('邀请发送成功');
      } catch (e: unknown) {
        if (e instanceof Error) {
            alert('邀请失败: ' + e.message);
        } else {
            alert('邀请失败: 发生未知错误');
        }
      } finally {
          setIsInviting(false);
      }
  };

  const handleUpdateLocation = async () => {
      try {
          setIsUpdatingLoc(true);
          await TerritoryService.putTerritoriesLocation(id, {
              x1: Number(locForm.x1),
              z1: Number(locForm.z1),
              x2: Number(locForm.x2),
              z2: Number(locForm.z2)
          });
          alert('位置更新请求已提交，等待管理员审核');
          loadTerritory();
      } catch (e: unknown) {
        if (e instanceof Error) {
            alert('更新失败: ' + e.message);
        } else {
            alert('更新失败: 发生未知错误');
        }
      } finally {
          setIsUpdatingLoc(false);
      }
  };

  const handleLeave = async () => {
      if (!confirm('确定要离开该领地吗？将扣除您在该领地的所有积分并只返还70%。')) return;
      try {
          // Remove self
          if (!user) return;
          await TerritoryService.deleteTerritoriesMembers(id, { qq: user.qq });
          alert('已退出领地');
          router.push('/dashboard/territories');
      } catch (e: unknown) {
        if (e instanceof Error) {
            alert('退出失败: ' + e.message);
        } else {
            alert('退出失败: 发生未知错误');
        }
      }
  };

  const handleDelete = async () => {
      if (!confirm('确定要申请删除该领地吗？此操作不可撤销。')) return;
      try {
          await TerritoryService.deleteTerritories(id);
          alert('删除申请已提交');
          loadTerritory(); // Status might change?
      } catch (e: unknown) {
        if (e instanceof Error) {
            alert('操作失败: ' + e.message);
        } else {
            alert('操作失败: 发生未知错误');
        }
      }
  };

  if (isLoading || loading) return <div className="p-8 text-center">Loading...</div>;
  if (!territory) return <div className="p-8 text-center text-red-500">领地未找到或无法访问</div>;

  const isOwner = user?.qq === territory.owner_id;

  return (
    <DashboardLayout title={territory.name} showBack>
      <div className="space-y-6">
        {/* Info Card */}
        <Card>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold">{territory.name}</h2>
                    <p className="text-sm text-gray-500">ID: {territory.id}</p>
                </div>
                <div className="flex flex-col items-end">
                    <Badge variant={territory.status === 'ACTIVE' ? 'success' : 'default'} className="mb-1">
                        {territory.status}
                    </Badge>
                    <Badge>{territory.type}</Badge>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                <div>
                    <p className="text-sm text-gray-500">当前积分</p>
                    <p className="text-2xl font-bold text-blue-600">{territory.credits}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">面积 / 成本</p>
                    <p className="text-lg font-semibold">{territory.area} / {territory.cost}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">坐标 X</p>
                    <p>{territory.x1} ~ {territory.x2}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">坐标 Z</p>
                    <p>{territory.z1} ~ {territory.z2}</p>
                </div>
            </div>
        </Card>

        {/* Actions for Member: Donate */}
        <Card title="积分捐赠">
             <div className="flex gap-2">
                 <Input 
                    type="number" 
                    placeholder="输入数量" 
                    value={donateAmount}
                    onChange={e => setDonateAmount(e.target.value)}
                 />
                 <Button onClick={handleDonate} isLoading={isDonating}>捐赠</Button>
             </div>
             <p className="text-xs text-gray-500 mt-2">
                 离开领地将返还70%积分，但该领地会扣除100%您捐赠的积分。
             </p>
        </Card>

        {/* Owner Actions */}
        {isOwner && (
            <>
                <Card title="领地管理">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">调整位置 (X1, Z1) to (X2, Z2)</label>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <Input type="number" placeholder="X1" value={locForm.x1} onChange={e => setLocForm({...locForm, x1: Number(e.target.value)})} />
                                <Input type="number" placeholder="Z1" value={locForm.z1} onChange={e => setLocForm({...locForm, z1: Number(e.target.value)})} />
                                <Input type="number" placeholder="X2" value={locForm.x2} onChange={e => setLocForm({...locForm, x2: Number(e.target.value)})} />
                                <Input type="number" placeholder="Z2" value={locForm.z2} onChange={e => setLocForm({...locForm, z2: Number(e.target.value)})} />
                            </div>
                            <Button onClick={handleUpdateLocation} isLoading={isUpdatingLoc}>更新位置/范围</Button>
                             <p className="text-xs text-gray-500 mt-1">更新位置需要管理员审核，且会重新计算成本。</p>
                        </div>
                        
                        <div className="border-t pt-4">
                            <label className="block text-sm font-medium mb-1">邀请成员</label>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="输入对方QQ号" 
                                    value={inviteQQ}
                                    onChange={e => setInviteQQ(e.target.value)}
                                />
                                <Button onClick={handleInvite} isLoading={isInviting} variant="secondary">邀请</Button>
                            </div>
                        </div>

                         <div className="border-t pt-4">
                            <Button onClick={handleDelete} variant="danger" fullWidth>申请删除领地</Button>
                        </div>
                    </div>
                </Card>
            </>
        )}

        {/* Leave Button */}
        {!isOwner && (
             <div className="py-4">
                 <Button onClick={handleLeave} variant="danger" fullWidth>退出领地</Button>
             </div>
        )}
      </div>
    </DashboardLayout>
  );
}
