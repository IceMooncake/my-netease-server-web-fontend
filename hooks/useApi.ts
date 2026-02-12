import { useState, useCallback } from 'react'

// 通用的API调用状态类型
interface ApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

/**
 * 通用的异步操作Hook
 * 可以用于任何API调用
 */
export function useAsyncOperation<T = unknown>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const execute = useCallback(async <P extends unknown[]>(
    operation: (...args: P) => Promise<T>,
    ...args: P
  ): Promise<T | null> => {
    setState({ data: null, isLoading: true, error: null })

    try {
      const result = await operation(...args)
      setState({ data: result, isLoading: false, error: null })
      return result
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || '操作失败'
      setState({ data: null, isLoading: false, error: errorMessage })
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

/**
 * 专门用于API请求的Hook
 * 处理常见的API响应模式
 */
export function useApiRequest<T = unknown>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const request = useCallback(async (
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    setState({ data: null, isLoading: true, error: null })

    try {
      const result = await apiCall()
      setState({ data: result, isLoading: false, error: null })
      return result
    } catch (error: unknown) {
      // 处理不同的错误类型
      let errorMessage = '请求失败'
      const err = error as { response?: { data?: { message?: string }; status: number }, request?: unknown }
      if (err.response) {
        // 服务器返回错误
        errorMessage = err.response.data?.message || `请求失败 (${err.response.status})`
      } else if (err.request) {
        // 网络错误
        errorMessage = '网络连接失败'
      } else {
        // 其他错误
        errorMessage = (err as Error).message || '未知错误'
      }

      setState({ data: null, isLoading: false, error: errorMessage })
      return null
    }
  }, [])

  return {
    ...state,
    request,
  }
}