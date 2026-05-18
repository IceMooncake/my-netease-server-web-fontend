import type { ApiRequestOptions } from '@/app/api/core/ApiRequestOptions'
import type { OnCancel } from '@/app/api/core/CancelablePromise'
import type { OpenAPIConfig } from '@/app/api/core/OpenAPI'
import { AuthenticationService, OpenAPI } from '@/app/api'
import { REQUEST_TIMEOUT, timeoutRouteMap } from '@/lib/request/timeout'
import { Router } from '@/lib'
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import FormData from 'form-data'
import { message } from 'antd'

// 刷新 token 锁与订阅队列，确保并发请求只触发一次刷新
let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null
const refreshSubscribers: Array<(token: string | null) => void> = []
OpenAPI.BASE = process.env.NEXT_PUBLIC_API_BASE || ''
console.log('API BASE:', OpenAPI.BASE)

const notifyRefresh = (token: string | null) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers.length = 0
}

export const sendRequest = async <T>(
  config: OpenAPIConfig,
  options: ApiRequestOptions,
  url: string,
  body: FormData,
  formData: FormData | undefined,
  headers: Record<string, string>,
  onCancel: OnCancel,
  axiosClient: AxiosInstance,
): Promise<AxiosResponse<T>> => {
  const source = axios.CancelToken.source()

  const requestConfig: AxiosRequestConfig = {
    url,
    headers,
    data: body ?? formData,
    method: options.method,
    withCredentials: config.WITH_CREDENTIALS,
    withXSRFToken: config.CREDENTIALS === 'include' ? config.WITH_CREDENTIALS : false,
    cancelToken: source.token,
  }

  onCancel(() => source.cancel('The user aborted a request.'))

  try {
    const res = await axiosClient.request({
      ...requestConfig,
      timeout: timeoutRouteMap.get(url) || REQUEST_TIMEOUT,
      withCredentials: true,
    })

    return res 
  } catch (error) {
    // 请求被取消，直接抛出错误
    if (error instanceof Error && 'code' in error && error.code === 'ERR_CANCELED') {
      throw error
    }
    // 处理网络超时等错误
    const axiosError = error as AxiosError<T>
    if ((axiosError.response?.status === 403 || axiosError.response?.status === 401) && !url.includes('/auth/refresh')) {
      // 如果没有正在刷新，则启动刷新并保存 Promise
      if (url.includes('/auth/login')) {
        const responseData = (axiosError.response?.data as { msg?: string })?.msg || axiosError.message || '请求失败'
      message.error(responseData)
      } else if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = AuthenticationService.postAuthRefresh()
          .then((refreshRes) => {
            isRefreshing = false
            if (
              refreshRes.access_token &&
              refreshRes.refresh_token
            ) {
              notifyRefresh(refreshRes.access_token)
              return refreshRes.access_token
            }
            // 刷新失败
            notifyRefresh(null)
            message.error('登录已过期，请重新登录')
            if (!url.includes('/auth/me')) Router.push('/login')
            return null
          })
          .catch((err: unknown) => {
            isRefreshing = false
            notifyRefresh(null)
            if (!url.includes('/auth/me')) Router.push('/login')
            throw err
          })
      }

      // 等待刷新完成
      const newToken = await (refreshPromise as Promise<string | null>)
      if (newToken) {
        return await axiosClient.request({
          ...requestConfig,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
          withCredentials: true,
        })
      }
      // 刷新失败且已重定向到登录，上层无需继续处理
      return axiosError.response
    } else if (
      axiosError.response?.status !== 200 &&
      !url.includes('/auth/refresh') && !url.includes('/auth/me')
    ) {
      // 获取错误信息
      const responseData = (axiosError.response?.data as { msg?: string })?.msg 
        || axiosError.response?.data as string 
        || '网络开小差啦，请稍后再试'
      message.error(responseData)
    }
    if (axiosError.response) {
      return axiosError.response
    }
    throw error
  }
}
