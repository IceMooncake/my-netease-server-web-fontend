'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TerritoryService } from '@/app/api';

export default function CreateTerritoryPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<'NO_ENTRY' | 'NO_BREAK'>('NO_ENTRY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) {
     router.push('/login');
     return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await TerritoryService.postTerritories({
          name,
          type
      });
      router.push(`/dashboard/territories/${result.id}`);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
          setError(err.message || '创建失败，请稍后重试');
      } else {
          setError('创建失败，请稍后重试');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="创建新领地" showBack>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">领地名称</label>
             <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="给领地起个名字" 
                required 
                maxLength={20}
             />
             <p className="text-xs text-gray-500 mt-1">创建后无法修改名称</p>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">领地类型</label>
             <div className="grid grid-cols-2 gap-4">
                 <div 
                    className={`cursor-pointer border rounded-lg p-4 text-center transition-colors ${type === 'NO_ENTRY' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}
                    onClick={() => setType('NO_ENTRY')}
                 >
                     <div className="font-bold text-gray-900">完全禁入</div>
                     <div className="text-xs text-gray-500 mt-1">除成员外禁止进入</div>
                 </div>
                 <div 
                    className={`cursor-pointer border rounded-lg p-4 text-center transition-colors ${type === 'NO_BREAK' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}
                    onClick={() => setType('NO_BREAK')}
                 >
                     <div className="font-bold text-gray-900">禁止破坏</div>
                     <div className="text-xs text-gray-500 mt-1">外人可进但不可破坏</div>
                 </div>
             </div>
          </div>

          {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                  {error}
              </div>
          )}

          <Button type="submit" fullWidth isLoading={isSubmitting}>
              立即创建 (无需消耗)
          </Button>

          <p className="text-xs text-gray-500 text-center">
              创建后，您需要先捐赠方块，再设置领地范围。
          </p>
        </form>
      </Card>
    </DashboardLayout>
  );
}
