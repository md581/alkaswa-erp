import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RoleId } from '../types';
import { apiClient } from '../utils/apiClient';

export interface UserProfile {
  userId: string;
  fullName: string;
  phone: string;
  designationEn: string;
  designationBn: string;
  department: string;
  avatarUrl?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: RoleId;
  profile: UserProfile;
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; fullName: string; phone: string; role?: RoleId }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthenticatedUser | null>(null);
  const setUser = (u: AuthenticatedUser | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('alkaswa_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('alkaswa_user');
    }
  };
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and verify user session on mount
  useEffect(() => {
    const initializeSession = async () => {
      const storedAccessToken = localStorage.getItem('alkaswa_access_token');
      const storedRefreshToken = localStorage.getItem('alkaswa_refresh_token');

      if (!storedAccessToken || !storedRefreshToken) {
        setIsLoading(false);
        return;
      }

      setAccessToken(storedAccessToken);

      try {
        // Fetch current user details
        const res = await apiClient.get('/api/auth/me');

        if (res.ok && res.data) {
          setUser(res.data);
        } else {
          // If expired or invalid, attempt token refresh
          const refreshRes = await apiClient.post('/api/auth/refresh', { refreshToken: storedRefreshToken }, { skipAuth: true });

          if (refreshRes.ok && refreshRes.data?.accessToken) {
            const newAccessToken = refreshRes.data.accessToken;
            localStorage.setItem('alkaswa_access_token', newAccessToken);
            setAccessToken(newAccessToken);

            // Re-fetch profile with new access token
            const retryRes = await apiClient.get('/api/auth/me');

            if (retryRes.ok && retryRes.data) {
              setUser(retryRes.data);
            } else {
              handleClearSession();
            }
          } else {
            handleClearSession();
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        handleClearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  const handleClearSession = () => {
    localStorage.removeItem('alkaswa_access_token');
    localStorage.removeItem('alkaswa_refresh_token');
    setAccessToken(null);
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient.post('/api/auth/login', { email, password }, { skipAuth: true });

      if (!res.ok) {
        return { success: false, error: res.error || 'Login failed' };
      }

      localStorage.setItem('alkaswa_access_token', res.data.accessToken);
      localStorage.setItem('alkaswa_refresh_token', res.data.refreshToken);
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);

      return { success: true };
    } catch (err) {
      console.error('Login request error:', err);
      return { success: false, error: 'Backend API is unreachable. Please check backend deployment or VITE_API_BASE_URL.' };
    }
  };

  const register = async (regData: { email: string; password: string; fullName: string; phone: string; role?: RoleId }) => {
    try {
      const res = await apiClient.post('/api/auth/register', regData, { skipAuth: true });

      if (!res.ok) {
        return { success: false, error: res.error || 'Registration failed' };
      }

      localStorage.setItem('alkaswa_access_token', res.data.accessToken);
      localStorage.setItem('alkaswa_refresh_token', res.data.refreshToken);
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);

      return { success: true };
    } catch (err) {
      console.error('Registration request error:', err);
      return { success: false, error: 'Backend API is unreachable. Please check backend deployment or VITE_API_BASE_URL.' };
    }
  };

  const logout = async () => {
    const storedRefreshToken = localStorage.getItem('alkaswa_refresh_token');
    if (storedRefreshToken) {
      try {
        await apiClient.post('/api/auth/logout', { refreshToken: storedRefreshToken }, { skipAuth: true });
      } catch (err) {
        console.error('Logout API call failed:', err);
      }
    }
    handleClearSession();
  };

  const resetPassword = async (email: string, passwordHash: string) => {
    try {
      const res = await apiClient.post('/api/auth/reset-password', { email, newPassword: passwordHash }, { skipAuth: true });

      if (!res.ok) {
        return { success: false, error: res.error || 'Password reset failed' };
      }

      return { success: true, message: res.data?.message };
    } catch (err) {
      console.error('Password reset request error:', err);
      return { success: false, error: 'Backend API is unreachable. Please check backend deployment or VITE_API_BASE_URL.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
