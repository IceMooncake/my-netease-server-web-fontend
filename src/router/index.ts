import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'

// 定义路由规则
const routes = [
  {
    path: '/',
    redirect: '/home' // 默认重定向
  },
  {
    path: '/home',
    name: 'home',
    component: LoginPage
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // history 模式（URL 不带 #）
  routes
})

export default router
