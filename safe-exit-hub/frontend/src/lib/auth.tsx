'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api, clearToken, getToken, setToken } from './api';

export type StaffSession = {
  staffId: number;
  fullName: string;
  roleName: string;
  permissionLevel: number;
};

type AuthContextValue = {
  staff: StaffSession | null;
  loading: boolean;
  login: (phone: string, code: string) => Promise<void>;
  sendOtp: (phone: string, channel?: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setStaff(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api<{
        staffId: number;
        fullName: string;
        roleName: string;
        permissionLevel: number;
      }>('/auth/me');
      setStaff(me);
    } catch {
      clearToken();
      setStaff(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sendOtp = async (phone: string, channel = 'sms') => {
    await api('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: phone, channel }),
    });
  };

  const login = async (phone: string, code: string) => {
    const res = await api<{
      token: string;
      staff: StaffSession;
    }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: phone, code }),
    });
    setToken(res.token);
    setStaff(res.staff);
  };

  const logout = () => {
    clearToken();
    setStaff(null);
  };

  return (
    <AuthContext.Provider value={{ staff, loading, login, sendOtp, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
