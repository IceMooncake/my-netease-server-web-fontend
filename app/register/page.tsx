'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    qq: '',
    password: '',
    confirmPassword: ''
  })
  const [validationError, setValidationError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  // Socket connection for verification
  useEffect(() => {
    if (verificationCode) {
        // Connect to the root URL (remove /api if present)
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';
        const socketUrl = apiBase.replace(/\/api\/?$/, '');
        
        const socket = io(socketUrl, {
            path: '/socket.io', // Default path, adjust if backend configured differently
            transports: ['websocket']
        });

        socket.on('connect', () => {
            console.log('Socket connected');
        });

        socket.on('registration_success', (data: { qq: string; success: boolean; message?: string }) => {
          if (data.qq !== formData.qq) return;

          if (data.success) {
            alert('验证成功，注册已完成！');
            router.push('/login');
            return;
          }

          alert(data.message || '注册失败，请重试');
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }
  }, [verificationCode, formData.qq, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null);

    if (formData.password !== formData.confirmPassword) {
        setValidationError("两次输入的密码不一致");
        return;
    }

    try {
      const res = await register(formData.qq, formData.password)
      if (res.code) {
          setVerificationCode(res.code);
      } else {
          // Fallback if no code returned (e.g. old behavior)
          alert('注册成功，请登录');
          router.push('/login');
      }
    } catch {
      // Error handles in hook
    }
  }

  if (verificationCode) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg relative overflow-hidden">
                 {/* Top decoration */}
                 <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>

                 <div className="text-center space-y-4">
                     <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl">
                        🔒
                     </div>
                     <h2 className="text-2xl font-bold text-gray-900">请完成验证</h2>
                     <p className="text-gray-600">
                         您的验证码如下，请**复制验证码**并发送到QQ群内完成验证。
                     </p>
                     
                     <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                         <span className="text-4xl font-mono font-bold tracking-widest text-blue-600 selection:bg-blue-200">
                             {verificationCode}
                         </span>
                     </div>
                     
                     <div className="flex justify-center space-x-4 text-sm text-gray-500 pt-4">
                        <div className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            正在等待群内验证...
                        </div>
                     </div>

                     <div className="mt-6 border-t pt-4">
                        <Button variant="ghost" onClick={() => setVerificationCode(null)}>
                            返回修改信息
                        </Button>
                     </div>
                 </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            注册账号
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
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
              placeholder="请输入密码（至少6位）"
              value={formData.password}
              onChange={handleInputChange}
            />
            <Input
              label="确认密码"
              name="confirmPassword"
              type="password"
              required
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>

          {(error || validationError) && (
            <div className="text-red-500 text-sm text-center">
              {error || validationError}
            </div>
          )}

          <div>
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
            >
              注册
            </Button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
              已有账号？去登录
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
