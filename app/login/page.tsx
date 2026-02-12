'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

export default function LoginPage() {
  const { login, isLoading, error } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    qq: '',
    password: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData.qq, formData.password)
      router.push('/dashboard')
    } catch (err) {
      // Error handles in hook
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Ice Town 登录
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            欢迎回来，请登录您的账户
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <Input
              label="QQ号"
              name="qq"
              type="text"
              required
              placeholder="请输入QQ号"
              value={formData.qq}
              onChange={handleInputChange}
            />
            <Input
              label="密码"
              name="password"
              type="password"
              required
              placeholder="请输入密码"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
            >
              登录
            </Button>
          </div>

          <div className="text-center">
            <Link href="/register" className="text-sm text-blue-600 hover:text-blue-500">
              还没有账号？去注册
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
