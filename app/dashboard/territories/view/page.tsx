'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TerritoryService, TerritoryResponse } from '@/app/api';
import {
    Alert,
    App,
    Button,
    Card,
    Col,
    Divider,
    Flex,
    Input,
    Row,
    Space,
    Spin,
    Tag,
    Typography,
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    EnvironmentOutlined,
    HeartOutlined,
    TeamOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { getStatusLabel, getStatusTagColor, getTerritoryTypeLabel } from '@/lib/status-display';

const { Title, Text } = Typography;

function TerritoryDetailContent() {
  const { user, isAuthenticated, isLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { message, modal } = App.useApp();

  const [territory, setTerritory] = useState<TerritoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Action states
  const [donateAmount, setDonateAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  
  const [inviteQQ, setInviteQQ] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const [locForm, setLocForm] = useState({ x1: '0', z1: '0', x2: '0', z2: '0' });
  const [isUpdatingLoc, setIsUpdatingLoc] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

    const loadTerritory = useCallback(async () => {
    if (!id) {
        setError('无效的领地ID');
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
            setError('');
      // Since there is no getById, we fetch all and find
      const list = await TerritoryService.getTerritoriesMine();
      const found = list.find(t => t.id === id);
      if (found) {
        setTerritory(found);
        setLocForm({ x1: String(found.x1), z1: String(found.z1), x2: String(found.x2), z2: String(found.z2) });
      } else {
                setTerritory(null);
                setError('领地未找到或您无访问权限');
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
                setError(e.message || '加载领地失败');
      } else {
                setError('加载领地失败：未知错误');
      }
    } finally {
      setLoading(false);
    }
    }, [id]);

  useEffect(() => {
    if (isAuthenticated) {
            loadTerritory();
    }
    }, [isAuthenticated, loadTerritory]);

  const handleDonate = async () => {
        if (!id) return;
            const amount = Number(donateAmount);
            if (!amount || amount <= 0) {
                message.warning('请输入大于 0 的捐赠数量');
                return;
            }
      try {
          setIsDonating(true);
                    await TerritoryService.postTerritoriesDonate(id, { amount });
          setDonateAmount('');
                    message.success('捐赠成功');
                    await refreshProfile(); // 更新个人额度
                    setTerritory(prev => prev ? { ...prev, credits: prev.credits + amount } : null); // 更新领地额度
      } catch {
      } finally {
          setIsDonating(false);
      }
  };

  const handleInvite = async () => {
      if (!id) return;
      try {
          setIsInviting(true);
          await TerritoryService.postTerritoriesInvite(id, { qq: inviteQQ });
          setInviteQQ('');
          message.success('邀请发送成功');
      } catch {} finally {
          setIsInviting(false);
      }
  };

  const handleUpdateLocation = async () => {
      if (!id) return;
      try {
          setIsUpdatingLoc(true);
          await TerritoryService.putTerritoriesLocation(id, {
              x1: Number(locForm.x1),
              z1: Number(locForm.z1),
              x2: Number(locForm.x2),
              z2: Number(locForm.z2)
          });
                    message.success('位置更新请求已提交，等待管理员审核');
                    await loadTerritory();
      } catch {} finally {
          setIsUpdatingLoc(false);
      }
  };

  const handleLeave = async () => {
            if (!id) return;
            const confirmed = await new Promise<boolean>((resolve) => {
                modal.confirm({
                    title: '确定要退出该领地吗？',
                    content: '退出后会扣除您在该领地的全部捐献额度，返还 90% 至个人额度。',
                    okText: '确认退出',
                    cancelText: '取消',
                    okButtonProps: { danger: true },
                    onOk: () => resolve(true),
                    onCancel: () => resolve(false),
                });
            });
            if (!confirmed) return;
      try {
          // Remove self
          if (!user) return;
          await TerritoryService.deleteTerritoriesMembers(id, { qq: user.qq });
                    message.success('已退出领地');
          router.push('/dashboard/territories');
      } catch {
      }
  };

  const handleDelete = async () => {
            if (!id) return;
            const confirmed = await new Promise<boolean>((resolve) => {
                modal.confirm({
                    title: '确定要申请删除该领地吗？',
                    content: '此操作不可撤销，提交后等待管理员审核。',
                    okText: '确认提交',
                    cancelText: '取消',
                    okButtonProps: { danger: true },
                    onOk: () => resolve(true),
                    onCancel: () => resolve(false),
                });
            });
            if (!confirmed) return;
      try {
          await TerritoryService.deleteTerritories(id);
                    message.success('删除申请已提交');
                    router.push('/dashboard/territories');
      } catch {
      }
  };

    if (isLoading || loading) {
        return (
            <DashboardLayout title="领地详情" showBack>
                <Flex justify="center" align="center" style={{ minHeight: 280 }}>
                    <Spin size="large" />
                </Flex>
            </DashboardLayout>
        );
    }

    if (!territory) {
        return (
            <DashboardLayout title="领地详情" showBack>
                <Alert type="error" showIcon title={error || '领地未找到或无法访问'} />
            </DashboardLayout>
        );
    }

  const isOwner = user?.qq === territory.owner_id;

  return (
    <DashboardLayout title={territory.name} showBack>
      <div className="space-y-6">
                <Card
                    variant={'borderless'}
                    style={{
                        borderRadius: 16,
                        boxShadow: '0 10px 28px rgba(88, 160, 232, 0.18)',
                        border: '1px solid rgba(126, 190, 247, 0.35)',
                        marginBottom: 24,
                    }}
                >
                    <Flex justify="space-between" align="flex-start" gap={12}>
                        <div>
                            <Title level={4} style={{ margin: 0, color: '#173f6f' }}>{territory.name}</Title>
                            <Text style={{ color: '#44658a' }}>ID: {territory.id}</Text>
                        </div>
                        <Space orientation="vertical" size={6}>
                            <Tag color={getStatusTagColor(territory.status)}>{territory.area === 0 ? '领地待确定范围' : getStatusLabel(territory.status)}</Tag>
                            <Tag color="red">{getTerritoryTypeLabel(territory.type)}</Tag>
                        </Space>
                    </Flex>

                    <Divider style={{ margin: '14px 0' }} />

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Text style={{ color: '#43658e' }}>领地内剩余可用方块额度</Text>
                            <Title level={3} style={{ margin: '6px 0 0', color: '#1f63a8' }}>{territory.credits}</Title>
                        </Col>
                        {territory.area !== 0 && <Col xs={24} sm={12}>
                            <Text style={{ color: '#43658e' }}><EnvironmentOutlined /> 坐标范围 X Z</Text>
                            <div>({territory.x1},{territory.z1}) ~ ({territory.x2},{territory.z2})</div>
                        </Col>}
                    </Row>
                </Card>

                <Card title={<Space><HeartOutlined /><span>额度贡献(个人额度 -&gt; 领地额度)</span></Space>} variant={'borderless'} style={{ borderRadius: 16, marginBottom: 24 }}>
                    <div style={{ marginBottom: 16 }}>
                        <Text style={{ color: '#43658e' }}>您的个人方块额度</Text>
                        <Title level={4} style={{ margin: '4px 0 0', color: '#1f63a8' }}>{user?.personal_credits || 0}</Title>
                    </div>
                         <Space.Compact block>
                             <Input
                                 type="number"
                                 placeholder="输入捐赠数量"
                                 value={donateAmount}
                                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDonateAmount(e.target.value)}
                             />
                             <Button type="primary" loading={isDonating} onClick={handleDonate}>捐赠</Button>
                         </Space.Compact>
                         <Text style={{ display: 'block', marginTop: 10, color: '#4d6e95', fontSize: 12 }}>
                             退出领地时返还个人 90% 已捐赠额度<br />同时领地额度会减少 100% 您的捐赠量
                         </Text>
        </Card>

        {isOwner && (
                    <Card title={<Space><EditOutlined /><span>领地管理</span></Space>} variant={'borderless'} style={{ borderRadius: 16 }}>
                        <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                            <div>
                                <Text strong style={{ color: '#24466f' }}>调整范围(对角线坐标)</Text>
                                <div style={{ marginTop: 12 }}>
                                    <Text style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#666' }}>起点坐标 (X1, Z1)</Text>
                                    <Space.Compact block style={{ marginBottom: 12 }}>
                                        <Input
                                            prefix={<span style={{ color: '#999', marginRight: 4 }}>X</span>}
                                            type="number"
                                            placeholder="X1"
                                            value={locForm.x1}
                                            onChange={(e) => setLocForm({ ...locForm, x1: e.target.value })}
                                        />
                                        <Input
                                            prefix={<span style={{ color: '#999', marginRight: 4 }}>Z</span>}
                                            type="number"
                                            placeholder="Z1"
                                            value={locForm.z1}
                                            onChange={(e) => setLocForm({ ...locForm, z1: e.target.value })}
                                        />
                                    </Space.Compact>

                                    <Text style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#666' }}>终点坐标 (X2, Z2)</Text>
                                    <Space.Compact block>
                                        <Input
                                            prefix={<span style={{ color: '#999', marginRight: 4 }}>X</span>}
                                            type="number"
                                            placeholder="X2"
                                            value={locForm.x2}
                                            onChange={(e) => setLocForm({ ...locForm, x2: e.target.value })}
                                        />
                                        <Input
                                            prefix={<span style={{ color: '#999', marginRight: 4 }}>Z</span>}
                                            type="number"
                                            placeholder="Z2"
                                            value={locForm.z2}
                                            onChange={(e) => setLocForm({ ...locForm, z2: e.target.value })}
                                        />
                                    </Space.Compact>
                                </div>
                                <Button type="primary" loading={isUpdatingLoc} onClick={handleUpdateLocation} style={{ marginTop: 16 }} block>
                                    更新位置/范围
                                </Button>
                                <Text style={{ display: 'block', marginTop: 8, color: '#4d6e95', fontSize: 12 }}>
                                    更新位置需要管理员审核，且会重新计算领地额度。
                                </Text>
                            </div>

                            <Divider style={{ margin: '0' }} />

                            <div>
                                <Text strong style={{ color: '#24466f' }}><TeamOutlined /> 邀请成员</Text>
                                <Space.Compact block style={{ marginTop: 10 }}>
                                    <Input
                                        placeholder="输入对方 QQ 号"
                                        value={inviteQQ}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteQQ(e.target.value)}
                                    />
                                    <Button loading={isInviting} onClick={handleInvite}>邀请</Button>
                                </Space.Compact>
                            </div>

                            <Divider style={{ margin: '0' }} />

                            <Button danger icon={<DeleteOutlined />} onClick={handleDelete} block>
                                申请删除领地
                            </Button>
                        </Space>
                    </Card>
        )}

        {!isOwner && (
                    <Card variant={'borderless'} style={{ borderRadius: 16 }}>
                        <Button danger icon={<LogoutOutlined />} onClick={handleLeave} block>
                            退出领地
                        </Button>
                    </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function TerritoryDetailPage() {
    return (
        <Suspense fallback={<DashboardLayout title="加载中" showBack><Flex justify="center"><Spin size="large"/></Flex></DashboardLayout>}>
            <TerritoryDetailContent />
        </Suspense>
    );
}
