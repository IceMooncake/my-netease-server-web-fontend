'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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
      <div className="flex flex-col items-center p-8 bg-white shadow-xl rounded-2xl">
        <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 text-white text-2xl font-bold">
            Ice
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Ice Town</h1>
        <div className="animate-pulse flex space-x-2 items-center text-gray-500 text-sm">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce delay-300"></div>
            <span>正在进入冰雪小镇...</span>
        </div>
      </div>
    </div>
  );
}
