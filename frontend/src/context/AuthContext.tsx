'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (email: string, name: string, token: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Verify token freshness against server profile
      refreshUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = async (authToken?: string) => {
    try {
      const activeToken = authToken || token;
      if (!activeToken) return;

      const response = await api.get('/auth/me');
      const refreshedUser = response.data.user;
      
      const parsedUser = {
        id: refreshedUser.id,
        email: refreshedUser.email,
        name: refreshedUser.name,
        role: refreshedUser.role,
      };

      setUser(parsedUser);
      localStorage.setItem('user', JSON.stringify(parsedUser));
    } catch (err) {
      console.error('Failed to sync session, logging out:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      // Route to correct dashboard based on role
      routeToDashboard(receivedUser.role);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (email: string, name: string, googleToken: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google-login', { email, name, googleToken });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      routeToDashboard(receivedUser.role);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', registerData);
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      routeToDashboard(receivedUser.role);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const routeToDashboard = (role: string) => {
    if (role === 'ADMIN') router.push('/admin');
    else if (role === 'FACULTY') router.push('/faculty');
    else if (role === 'STUDENT') router.push('/student');
    else if (role === 'PARENT') router.push('/parent');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, googleLogin, register, logout, refreshUser }}>
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
