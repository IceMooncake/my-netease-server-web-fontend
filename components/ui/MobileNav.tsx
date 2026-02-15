'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu, MenuProps } from 'antd';
import { HomeOutlined, EnvironmentOutlined, UserOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

const { Footer } = Layout;

export const MobileNav: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [current, setCurrent] = useState<string>('home');

    useEffect(() => {
        if (pathname === '/dashboard') {
             setCurrent('home');
        } else if (pathname?.startsWith('/dashboard/territories')) {
             setCurrent('territories');
        } else if (pathname?.startsWith('/profile')) {
             setCurrent('profile');
        } else {
             setCurrent('');
        }
    }, [pathname]);

    const items: MenuProps['items'] = [
        {
            label: '首页',
            key: 'home',
            icon: <HomeOutlined />,
            onClick: () => router.push('/dashboard'),
        },
        {
            label: '我的领地',
            key: 'territories',
            icon: <EnvironmentOutlined />,
            onClick: () => router.push('/dashboard/territories'),
        },
        {
            label: '我的',
            key: 'profile',
            icon: <UserOutlined />,
            onClick: () => router.push('/profile'),
        },
    ];

    return (
        <Footer 
            style={{ 
                position: 'fixed', 
                bottom: 0, 
                width: '100%', 
                padding: 0, 
                zIndex: 1000, 
                background: '#fff',
                borderTop: '1px solid #f0f0f0' 
            }}
        >
            <Menu 
                mode="horizontal" 
                selectedKeys={[current]}
                items={items}
                style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    borderBottom: 'none',
                    lineHeight: '46px' // Adjust for better mobile touch target
                }}
            />
        </Footer>
    );
};
