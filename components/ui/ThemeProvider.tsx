'use client'

import React from 'react'
import { ConfigProvider, theme, App } from 'antd'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#5aa8f2',
          colorLink: '#4f9be6',
          borderRadius: 14,
          colorBgBase: '#edf5ff',
          colorTextBase: '#1f2a44',
          colorBorder: '#c0dbf7',
          boxShadowSecondary: '0 10px 30px rgba(90, 168, 242, 0.2)',
        },
        components: {
          Layout: {
            headerBg: 'rgba(255, 255, 255, 0.58)',
            bodyBg: 'transparent',
          },
          Card: {
            colorBgContainer: 'rgba(255, 255, 255, 0.55)',
          },
          Input: {
            activeBorderColor: '#78b8f4',
            hoverBorderColor: '#89c1f5',
          },
          Button: {
            colorPrimary: '#5aa8f2',
            colorPrimaryHover: '#77bbf8',
          },
        },
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  )
}
