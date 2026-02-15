'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TerritoryService } from '@/app/api';
import { Card, Button, Form, Input, Typography, Row, Col, App } from 'antd';
import { StopOutlined, BuildOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function CreateTerritoryPage() {
  const { message } = App.useApp();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const [type, setType] = useState<'NO_ENTRY' | 'NO_BREAK'>('NO_ENTRY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) {
     router.push('/login');
     return null;
  }

  const onFinish = async (values: unknown) => {
    setIsSubmitting(true);
    try {
      const result = await TerritoryService.postTerritories({
          name: (values as { name: string }).name,
          type
      });
      message.success('领地创建成功！');
      router.push(`/dashboard/territories/${result.id}`);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="创建新领地" showBack>
      <Card variant={'borderless'} style={{ maxWidth: 600, margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>建立新家园</Title>
        
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="large"
        >
            <Form.Item
                name="name"
                label="领地名称"
                rules={[{ required: true, message: '请给您的领地起个名字' }, { max: 20, message: '名称不能超过20个字符' }]}
            >
                <Input placeholder="例如：冰城" count={{ show: true, max: 20 }} />
            </Form.Item>

            <Form.Item label="领地类型" required>
                <Row gutter={16}>
                    <Col span={12}>
                        <Card 
                            hoverable
                            className={type === 'NO_ENTRY' ? 'border-primary bg-primary-light' : ''}
                            style={{ 
                                textAlign: 'center', 
                                borderColor: type === 'NO_ENTRY' ? '#1890ff' : '#f0f0f0',
                                background: type === 'NO_ENTRY' ? '#e6f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                            onClick={() => setType('NO_ENTRY')}
                        >
                            <StopOutlined style={{ fontSize: 24, color: type === 'NO_ENTRY' ? '#1890ff' : '#8c8c8c' }} />
                            <div style={{ marginTop: 8, fontWeight: 'bold' }}>完全禁入</div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>除成员外禁止进入</div>
                        </Card>
                    </Col>
                    <Col span={12}>
                         <Card 
                            hoverable
                            style={{ 
                                textAlign: 'center', 
                                borderColor: type === 'NO_BREAK' ? '#1890ff' : '#f0f0f0',
                                background: type === 'NO_BREAK' ? '#e6f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                            onClick={() => setType('NO_BREAK')}
                        >
                            <BuildOutlined style={{ fontSize: 24, color: type === 'NO_BREAK' ? '#1890ff' : '#8c8c8c' }} />
                            <div style={{ marginTop: 8, fontWeight: 'bold' }}>禁止破坏</div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>冒险模式(可使用容器)</div>
                        </Card>
                    </Col>
                </Row>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSubmitting} block size="large" style={{ height: '48px', fontSize: '16px' }}>
                    立即创建 (无需消耗)
                </Button>
                <Paragraph type="secondary" style={{ textAlign: 'center', marginTop: 16, fontSize: '12px' }}>
                   * 创建后，您需要先捐赠方块，再设置领地范围。
                </Paragraph>
            </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
