'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Spin, Typography, Card } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // Prevent hydration mismatch or infinite loop by waiting for initial load
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card variant={'borderless'} style={{ boxShadow: 'none', background: 'transparent' }}>
        <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-700 text-2xl font-bold shadow-lg">
                Ice
            </div>
            <Title level={4} style={{ marginBottom: 24, color: '#1f2937' }}>Ice Town</Title>
            
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} description="正在进入冰雪小镇..." />
        </div>
      </Card>
    </div>
  );
}
