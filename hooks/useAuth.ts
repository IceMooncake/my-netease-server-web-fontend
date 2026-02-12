import { useState, useCallback, useEffect } from 'react'
import { AuthenticationService, UserProfileResponse } from '@/app/api'
import { useRouter } from 'next/navigation'
import { fetchAndSaveUser, getCurrentUser, clearCurrentUser } from '@/lib/auth'

interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  user: UserProfileResponse | null
  error: string | null
}

interface UseAuthReturn extends AuthState {
  login: (qq: string, password: string) => Promise<void>
  logout: () => void
  register: (qq: string, password: string) => Promise<{ success: boolean; code: string }>
  refreshProfile: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    isLoading: true, // Start with loading to check initial state
    isAuthenticated: false,
    user: null,
    error: null,
  })

  // Initialize auth state from local storage or fetch
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = getCurrentUser();
      if (storedUser) {
        setState(prev => ({ ...prev, isAuthenticated: true, user: storedUser, isLoading: false }));
      }
      
      // Always try to refresh from server to check if session is still valid
      try {
        const user = await fetchAndSaveUser();
        setState(prev => ({ ...prev, isAuthenticated: true, user: user, isLoading: false }));
      } catch (e) {
        // If fetch fails (401), we are not authenticated
        clearCurrentUser();
        setState(prev => ({ ...prev, isAuthenticated: false, user: null, isLoading: false }));
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (qq: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      await AuthenticationService.postAuthLogin({ qq, password })
      
      // After login, fetch user profile
      const user = await fetchAndSaveUser();

      setState({
        isLoading: false,
        isAuthenticated: true,
        user: user,
        error: null,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      // If it's an ApiError (from generated code), might have body.message
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

  const register = useCallback(async (qq: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const response = await AuthenticationService.postAuthRegister({ qq, password })
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
        setState(prev => ({ ...prev, user }));
     } catch (e) {
         // ignore
     }
  }, []);

  return {
    ...state,
    login,
    logout,
    register,
    refreshProfile
  }
}
