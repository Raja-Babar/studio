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
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: { [email: string]: User & { password?: string } } = {
  'admin@example.com': { name: 'Admin User', email: 'admin@example.com', role: 'Admin', password: 'password' },
  'employee@example.com': { name: 'Employee User', email: 'employee@example.com', role: 'Employee', password: 'password' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUsers = () => {
       try {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
          Object.assign(MOCK_USERS, JSON.parse(storedUsers));
        }
      } catch (error) {
        console.error("Failed to parse users from localStorage", error);
      }
    };
    
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
      }
    }

    loadUsers();
    loadUser();
    setIsLoading(false);
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

  const signup = async (name: string, email: string, pass: string): Promise<void> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (MOCK_USERS[email]) {
          setIsLoading(false);
          reject(new Error('An account with this email already exists.'));
        } else {
          const newUser = { name, email, role: 'Employee' as const, password: pass };
          MOCK_USERS[email] = newUser;
          try {
            const usersToStore = { ...MOCK_USERS };
            Object.values(usersToStore).forEach(u => delete u.password);
            localStorage.setItem('users', JSON.stringify(usersToStore));
          } catch(e) {
            console.error("Could not save users to local storage", e)
          }
          setIsLoading(false);
          resolve();
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
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
