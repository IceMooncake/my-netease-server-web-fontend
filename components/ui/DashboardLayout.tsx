'use client';

import React from 'react';
import { MobileNav } from './MobileNav';
import { Layout, Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Header, Content } = Layout;
const { Title } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  showBack=false, 
  actions 
}) => {
  const router = useRouter();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {title && (
        <Header 
            style={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 40, 
                width: '100%', 
            background: 'rgba(255, 255, 255, 0.58)', 
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
            boxShadow: '0 8px 22px rgba(84, 155, 228, 0.16)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.45)'
            }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {showBack && (
                <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => router.back()} 
                    style={{ marginRight: 8 }}
                />
            )}
            <Title level={4} style={{ margin: 0, color: '#333' }}>{title}</Title>
          </div>
          {actions && <div>{actions}</div>}
        </Header>
      )}
      <Content style={{ 
          padding: '16px',
          paddingBottom: '70px', 
          maxWidth: 800, 
          margin: '0 auto', 
          width: '100%',
          marginTop: title ? 0 : 16,
          background: 'transparent'
        }}>
        {children}
      </Content>
      <MobileNav />
    </Layout>
  );
};
