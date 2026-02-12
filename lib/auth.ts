import { AuthenticationService, UserProfileResponse } from '@/app/api';

// Simple user storage key
const USER_KEY = 'icetown_user';

export const getCurrentUser = (): UserProfileResponse | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user: UserProfileResponse) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearCurrentUser = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
};

export const fetchAndSaveUser = async () => {
    try {
        const user = await AuthenticationService.getAuthMe();
        setCurrentUser(user);
        return user;
    } catch (e) {
        clearCurrentUser();
        throw e;
    }
}
