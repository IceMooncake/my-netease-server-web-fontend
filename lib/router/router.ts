import { redirect } from 'next/navigation'

/**
 * 客户端路由跳转工具函数
 * 在服务端组件中使用 redirect()
 */
export function navigateTo(path: string) {
  redirect(path)
}

/**
 * 客户端路由跳转 (在客户端代码中使用)
 * 注意: 这个函数只能在客户端组件中调用
 */
export function clientNavigate(path: string) {
  if (typeof window !== 'undefined') {
    window.location.href = path
  }
}

/**
 * Next.js 路由工具类
 * 提供统一的路由跳转方法
 */
export class Router {
  /**
   * 跳转到指定路径
   * 在客户端组件中使用 useRouter().push()
   * 在服务端组件中使用 redirect()
   */
  static push(path: string) {
    // 在客户端环境中使用 window.location
    if (typeof window !== 'undefined') {
      window.location.href = path
    }
  }

  /**
   * 替换当前路由
   */
  static replace(path: string) {
    if (typeof window !== 'undefined') {
      window.location.replace(path)
    }
  }

  /**
   * 返回上一页
   */
  static back() {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  /**
   * 刷新页面
   */
  static reload() {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }
}