'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button, Input, Card, Form, Typography, Flex, message } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import Link from 'next/link'
import Image from 'next/image'
import loginBackground from '@/assets/login-background.png'
import loginTitle from '@/assets/login-title.png'

const { Title, Text } = Typography

type LoginFormValues = {
  qq: string
  password: string
}

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true)
    try {
      await login(values.qq, values.password)
      router.push('/dashboard')
    } catch {
       // Error handled
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative h-screen flex items-center justify-center px-4 py-8 overflow-hidden">
      <Image
        src={loginBackground}
        alt="登录背景"
        fill
        loading="lazy"
        fetchPriority="low"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 w-full" style={{ maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Image
            src={loginTitle}
            alt="IceTown"
            loading="lazy"
            fetchPriority="low"
            style={{ width: '100%', height: 'auto', maxWidth: 360, margin: '0 auto' }}
          />
        </div>

        <Card style={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3} style={{ color: '#1677ff', margin: 5 }}>登录</Title>
            <Text style={{ color: '#24466f', fontWeight: 500 }}>欢迎回来，请登录以查看租赁服个人信息</Text>
          </div>

          <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
          >
            <Form.Item
              name="qq"
              rules={[{ required: true, message: '请输入您的QQ号!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="QQ号" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入您的密码!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码(不是QQ密码!!!)" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading || isLoading} icon={<LoginOutlined />}>
                登录
              </Button>
            </Form.Item>

            <Flex justify="center">
              <Text style={{ color: '#24466f' }}>还没有账号？ <Link href="/register" style={{ color: '#1677ff', fontWeight: 600 }}>立即注册</Link></Text>
            </Flex>
          </Form>
        </Card>
      </div>
    </div>
  )
}
