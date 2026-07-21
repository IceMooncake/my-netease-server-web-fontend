import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

/**
 * 获取 tRPC API 基础 URL
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return (process.env.NEXT_PUBLIC_API_BASE || '/api').replace(/\/api\/?$/, '') + '/api/trpc';
  }
  return (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3101/api').replace(/\/api\/?$/, '') + '/api/trpc';
}

/**
 * 原生 tRPC 客户端
 * 使用 any 泛型因为前后端分离无法共享 Router 类型
 */
export const trpcClient: any = createTRPCClient<any>({
  links: [
    httpBatchLink({
      url: getBaseUrl(),
      transformer: superjson,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});
