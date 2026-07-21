/**
 * 后端 tRPC AppRouter 类型定义（文档用途）
 * 与后端 src/trpc/routers/index.ts 保持一致
 *
 * 由于前后端分离，无法共享 Router 类型。
 * 此处定义接口仅用于文档参考，实际 client 使用 any 泛型。
 */

export interface AuthRouter {
  register: { input: { qq: string; password: string; nick_name?: string }; output: { success: boolean; code: string } };
  login: { input: { qq: string; password: string }; output: { qq: string; msg: string; access_token: string; token_type: string; expires_in: number; refresh_token: string } };
  // ... 其他过程定义省略，见后端 src/trpc/routers/
}

// 实际使用 any 类型以兼容 createTRPCClient 的泛型约束
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type AppRouter = any;
