'use client'

import { useRouter as useNextRouter } from 'next/navigation'

/**
 * Next.js 客户端路由 Hook
 * 在客户端组件中使用
 */
export function useRouter() {
  const router = useNextRouter()

  return {
    push: (path: string) => router.push(path),
    replace: (path: string) => router.replace(path),
    back: () => router.back(),
    refresh: () => router.refresh(),
    prefetch: (path: string) => router.prefetch(path),
  }
}

/**
 * 编程式路由导航 Hook
 * 提供更直观的API
 */
export function useNavigation() {
  const router = useNextRouter()

  return {
    // 导航方法
    goToLogin: () => router.push('/login'),
    goToHome: () => router.push('/'),
    goToDashboard: () => router.push('/dashboard'),
    goToProfile: () => router.push('/profile'),

    // 通用方法
    navigate: (path: string) => router.push(path),
    redirect: (path: string) => router.replace(path),
    goBack: () => router.back(),
    refresh: () => router.refresh(),

    // 工具方法
    goToTerritory: (id: string | number) => router.push(`/territories/${id}`),
    goToProposal: (id: string | number) => router.push(`/proposals/${id}`),
  }
}