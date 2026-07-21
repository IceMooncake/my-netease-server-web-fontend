import { trpcClient } from '@/lib/trpc/client';

// Simple user storage key
const USER_KEY = 'icetown_user';

export interface UserProfile {
  qq: string;
  nick_name: string | null;
  personal_credits: number;
  status: string;
  is_admin: number;
  next_nickname_update_at: string | null;
}

export const getCurrentUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user: UserProfile) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearCurrentUser = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
};

export const fetchAndSaveUser = async () => {
    try {
        const user = await trpcClient.user.me.query();
        setCurrentUser(user);
        return user;
    } catch (e) {
        clearCurrentUser();
        throw e;
    }
}
