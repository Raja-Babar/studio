'use client';

import React, { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

type User = {
  name: string;
  email: string;
  role: 'Admin' | 'Employee';
};

type AuthContextType = {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS = {
  'admin@example.com': { name: 'Admin User', email: 'admin@example.com', role: 'Admin', password: 'password' },
  'employee@example.com': { name: 'Employee User', email: 'employee@example.com', role: 'Employee', password: 'password' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = MOCK_USERS[email as keyof typeof MOCK_USERS];
        if (foundUser && foundUser.password === pass) {
          const { password, ...userToStore } = foundUser;
          setUser(userToStore);
          localStorage.setItem('user', JSON.stringify(userToStore));
          setIsLoading(false);
          resolve();
        } else {
          setIsLoading(false);
          reject(new Error('Invalid email or password.'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };
  
  if (isLoading && !user) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="w-full max-w-md space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
