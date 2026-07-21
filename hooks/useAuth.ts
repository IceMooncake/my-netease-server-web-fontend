import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchAndSaveUser, getCurrentUser, clearCurrentUser, type UserProfile } from '@/lib/auth'
import { trpcClient } from '@/lib/trpc/client'

interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  user: UserProfile | null
  error: string | null
}

interface UseAuthReturn extends AuthState {
  login: (qq: string, password: string) => Promise<void>
  logout: () => void
  register: (qq: string, password: string, nick_name: string) => Promise<{ success: boolean; code: string }>
  refreshProfile: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    error: null,
  })

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = getCurrentUser();
      if (storedUser) {
        setState(prev => ({ ...prev, isAuthenticated: true, user: storedUser, isLoading: false }));
      }
      
      try {
        const user = await fetchAndSaveUser();
        setState(prev => ({ ...prev, isAuthenticated: true, user: user, isLoading: false }));
      } catch {
        clearCurrentUser();
        setState(prev => ({ ...prev, isAuthenticated: false, user: null, isLoading: false }));
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (qq: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      await trpcClient.auth.login.mutate({ qq, password })
      
      const user = await fetchAndSaveUser();

      setState({
        isLoading: false,
        isAuthenticated: true,
        user: user,
        error: null,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        error: message,
      }))
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    clearCurrentUser();
    setState({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      error: null,
    })
    router.push('/login');
  }, [router])

  const register = useCallback(async (qq: string, password: string, nick_name: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const response = await trpcClient.auth.register.mutate({ qq, password, nick_name })
      setState(prev => ({ ...prev, isLoading: false }))
      return response
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setState(prev => ({ ...prev, isLoading: false, error: message }))
      throw err
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const user = await fetchAndSaveUser();
      setState(prev => ({ ...prev, user: user, isAuthenticated: true }));
    } catch {
      // ignore
    }
  }, []);

  return {
    ...state,
    login,
    logout,
    register,
    refreshProfile,
  }
}
