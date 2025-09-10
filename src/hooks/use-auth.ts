
'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/auth-provider';

type UserRole = 'Admin' | 'Employee';
type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
type StoredUser = User & { passwordHash: string };

type AttendanceRecord = {
  employeeId: string;
  name: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Not Marked';
};

type AuthContextType = {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (id: string, name: string, email: string, pass: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  getUsers: () => Omit<StoredUser, 'passwordHash'>[];
  importUsers: (users: StoredUser[]) => Promise<void>;
  resetUsers: () => Promise<void>;
  updateUser: (email: string, data: Partial<Omit<User, 'email' | 'id'>>) => Promise<void>;
  deleteUser: (email: string) => Promise<void>;
  attendanceRecords: AttendanceRecord[];
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
