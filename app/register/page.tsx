'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button, Input, Card, Form, Typography, Flex, Alert, Divider, Space, Spin, App } from 'antd'
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import Image from 'next/image'
import loginBackground from '@/assets/login-background.png'
import loginTitle from '@/assets/login-title.png'

const { Title, Text } = Typography

type RegisterFormValues = {
    qq: string
    password: string
    nick_name: string
}

export default function RegisterPage() {
  const { message } = App.useApp();
  const { register, isLoading } = useAuth()
  const router = useRouter()
  const [form] = Form.useForm()
  
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (verificationCode) {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';
        const socketUrl = apiBase.replace(/\/api\/?$/, '');
        
        const socket = io(socketUrl, {
            path: '/socket.io',
            transports: ['websocket']
        });

        socket.on('registration_success', (data: { qq: string; success: boolean; message?: string }) => {
          const currentQQ = form.getFieldValue('qq');
          if (data.qq !== currentQQ) return;

          if (data.success) {
            message.success('验证成功！正在跳转登录...');
            socket.disconnect();
            setTimeout(() => {
                router.push('/login');
            }, 2000);
          } else {
             message.error(data.message || '验证失败');
          }
        });

        socketRef.current = socket;

        return () => {
          socket.disconnect();
        };
    }
  }, [verificationCode, form, router, message]);


    const onFinish = async (values: RegisterFormValues) => {
    try {
      const res = await register(values.qq, values.password, values.nick_name);
      if (res && res.code) {
          setVerificationCode(res.code);
      } else {
          message.success('注册成功');
          router.push('/login');
      }
        } catch {
        // handled
    }
  }

  return (
        <div className="relative h-screen flex items-center justify-center px-4 py-8 overflow-hidden">
            <Image
                src={loginBackground}
                alt="注册背景"
                fill
                priority
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />

            <div className="relative z-10 w-full" style={{ maxWidth: 480 }}>
                <Card style={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '16px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Title level={3} style={{ color: '#1677ff', margin: 5 }}>注册</Title>
                        <Text style={{ color: '#24466f', fontWeight: 500 }}>创建您的账户，开启冰城冒险之旅</Text>
                    </div>

                    {!verificationCode ? (
            <Form
                form={form}
                name="register"
                onFinish={onFinish}
                layout="vertical"
                scrollToFirstError
                style={{ rowGap: 4 }}
            >
            <Form.Item
                name="qq"
                label="QQ号"
                style={{ marginBottom: 5 }}
                rules={[
                    { required: true, message: '请输入您的QQ号!' },
                    { pattern: /^[1-9][0-9]{4,10}$/, message: '请输入有效的QQ号' }
                ]}
            >
                <Input prefix={<UserOutlined />} placeholder="QQ号" />
            </Form.Item>

            <Form.Item
                name="nick_name"
                label="游戏内昵称(每月只能改一次哦)"
                style={{ marginBottom: 5 }}
                rules={[
                    { required: true, message: '请输入您的昵称!' },
                    { min: 2, message: '昵称至少2个字符' }
                ]}
            >
                <Input prefix={<UserOutlined />} placeholder="昵称" />
            </Form.Item>

            <Form.Item
                name="password"
                label="密码(尽量不使用QQ密码)"
                style={{ marginBottom: 5 }}
                rules={[
                    { required: true, message: '请输入密码!' },
                    { min: 6, message: '密码至少6位' }
                ]}
                hasFeedback
            >
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item
                name="confirm"
                label="确认密码"
                dependencies={['password']}
                hasFeedback
                rules={[
                { required: true, message: '请确认您的密码!' },
                ({ getFieldValue }) => ({
                    validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致!'));
                    },
                }),
                ]}
            >
                <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={isLoading}>
                下一步：验证QQ
                </Button>
            </Form.Item>
            
            <Flex justify="center">
                <Text style={{ color: '#24466f' }}>已有账号？ <Link href="/login" style={{ color: '#1677ff', fontWeight: 600 }}>去登录</Link></Text>
            </Flex>
            </Form>
          ) : (
            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                    message="验证步骤"
                    description="为了验证如果您是该QQ号的主人，请按照以下步骤操作。"
                    type="info"
                    showIcon
                />
                
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center">
                    <Text strong style={{ fontSize: 16 }}>请使用QQ发送以下验证码给机器人：</Text>
                    <Divider style={{ margin: '12px 0' }} />
                    <Title level={1} copyable style={{ color: '#1890ff', margin: 0 }}>{verificationCode}</Title>
                    <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>机器人QQ: 123456789 (示例)</Text>
                </div>

                <div className="flex justify-center items-center gap-2 text-gray-500">
                    <Spin indicator={<SafetyCertificateOutlined spin />} />
                    <span>正在等待验证...</span>
                </div>

                <Button block onClick={() => setVerificationCode(null)}>返回修改信息</Button>
            </Space>
                    )}
                </Card>
            </div>
    </div>
  )
}
