'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
    const { user, logout } = useAuth();

    return (
        <DashboardLayout title="个人中心">
            <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col items-center">
                 <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mb-4">
                     {user?.qq?.slice(0, 2)}
                 </div>
                 <h2 className="text-xl font-bold">{user?.nick_name || user?.qq}</h2>
                 <p className="text-gray-500">QQ: {user?.qq}</p>
                 <div className="mt-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                     {user?.status}
                 </div>
            </div>
            
            <div className="space-y-3">
                <Button variant="danger" fullWidth onClick={logout}>退出登录</Button>
            </div>
        </DashboardLayout>
    );
}
