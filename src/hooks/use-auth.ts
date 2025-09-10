
'use client';

import { useContext } from 'react';
import { AuthContext, AttendanceRecord } from '@/context/auth-provider';

type UserRole = 'Admin' | 'Employee';
type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
type StoredUser = User & { passwordHash: string };

type EmployeeReport = {
    id: string;
    employeeId: string;
    employeeName: string;
    submittedDate: string;
    stage: string;
    type: string;
    quantity: number;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  getUsers: () => Omit<StoredUser, 'passwordHash'>[];
  importUsers: (users: StoredUser[]) => Promise<void>;
  resetUsers: () => Promise<void>;
  updateUser: (email: string, data: Partial<Omit<User, 'email' | 'id'>>) => Promise<void>;
  deleteUser: (email: string) => Promise<void>;
  attendanceRecords: AttendanceRecord[];
  updateAttendance: (employeeId: string, actions: { clockIn?: boolean; clockOut?: boolean }) => void;
  updateAttendanceRecord: (employeeId: string, date: string, data: Partial<Omit<AttendanceRecord, 'employeeId' | 'date' | 'name'>>) => void;
  deleteAttendanceRecord: (employeeId: string, date: string) => void;
  employeeReports: EmployeeReport[];
  addEmployeeReport: (report: Omit<EmployeeReport, 'id'> & { id?: string }) => void;
  updateEmployeeReport: (reportId: string, data: Partial<Omit<EmployeeReport, 'id'>>) => void;
  deleteEmployeeReport: (reportId: string) => void;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
