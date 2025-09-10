
'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { attendanceRecords as defaultAttendanceRecords } from '@/lib/placeholder-data';

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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const simpleHash = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const getDefaultUsers = async (): Promise<{ [email: string]: StoredUser }> => ({
  'admin@example.com': { id: 'EMP000', name: 'Admin User', email: 'admin@example.com', role: 'Admin', passwordHash: await simpleHash('admin123') },
  'employee@example.com': { id: 'EMP101', name: 'Employee User', email: 'employee@example.com', role: 'Employee', passwordHash: await simpleHash('emp123') },
});


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mockUsers, setMockUsers] = useState<{ [email: string]: StoredUser }>({});
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);


  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const syncUsersToStorage = useCallback((users: { [email: string]: StoredUser }) => {
    try {
      localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
      console.error("Failed to save users to localStorage", error);
    }
  }, []);

  const syncAttendanceToStorage = useCallback((records: AttendanceRecord[]) => {
    try {
      localStorage.setItem('attendance', JSON.stringify(records));
    } catch (error) {
      console.error("Failed to save attendance to localStorage", error);
    }
  }, []);
  
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    if (pathname !== '/login') {
       router.push('/login');
    }
  }, [router, pathname]);

  useEffect(() => {
    const initAuth = async () => {
      let storedUsers: { [email: string]: StoredUser } = {};
      try {
        const usersFromStorage = localStorage.getItem('users');
        if (usersFromStorage) {
          storedUsers = JSON.parse(usersFromStorage);
        } else {
          storedUsers = await getDefaultUsers();
          syncUsersToStorage(storedUsers);
        }
      } catch (error) {
        console.error("Failed to parse users from localStorage, resetting to default.", error);
        storedUsers = await getDefaultUsers();
        syncUsersToStorage(storedUsers);
      }
      setMockUsers(storedUsers);

      let storedAttendance: AttendanceRecord[] = [];
      try {
        const attendanceFromStorage = localStorage.getItem('attendance');
        if (attendanceFromStorage) {
          storedAttendance = JSON.parse(attendanceFromStorage);
        } else {
          storedAttendance = defaultAttendanceRecords;
          syncAttendanceToStorage(storedAttendance);
        }
      } catch (error) {
        console.error("Failed to parse attendance from localStorage, resetting to default.", error);
        storedAttendance = defaultAttendanceRecords;
        syncAttendanceToStorage(storedAttendance);
      }
      setAttendanceRecords(storedAttendance);


      try {
        const storedUser = localStorage.getItem('user');
        const lastActivity = localStorage.getItem('lastActivity');
        if (storedUser && lastActivity) {
          const lastActivityTime = parseInt(lastActivity, 10);
          if (Date.now() - lastActivityTime < INACTIVITY_TIMEOUT) {
            setUser(JSON.parse(storedUser));
            localStorage.setItem('lastActivity', Date.now().toString());
          } else {
            localStorage.removeItem('user');
            localStorage.removeItem('lastActivity');
          }
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
      }
      setIsLoading(false);
    };

    initAuth();
  }, [syncUsersToStorage, syncAttendanceToStorage]);

  useEffect(() => {
    let activityTimer: NodeJS.Timeout;
    const resetTimer = () => {
        clearTimeout(activityTimer);
        activityTimer = setTimeout(() => {
            if(user) {
                toast({
                    variant: 'destructive',
                    title: 'Session Expired',
                    description: 'You have been logged out due to inactivity.',
                });
                logout();
            }
        }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

    const activityListener = () => {
        localStorage.setItem('lastActivity', Date.now().toString());
        resetTimer();
    };

    if (user) {
        events.forEach(event => window.addEventListener(event, activityListener));
        resetTimer();
    }

    return () => {
        clearTimeout(activityTimer);
        events.forEach(event => window.removeEventListener(event, activityListener));
    };
  }, [user, logout, toast]);


  const login = async (email: string, pass: string): Promise<void> => {
    setIsLoading(true);
    const passwordHash = await simpleHash(pass);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers[email];
        if (foundUser && foundUser.passwordHash === passwordHash) {
          const { passwordHash: _, ...userToStore } = foundUser;
          setUser(userToStore);
          localStorage.setItem('user', JSON.stringify(userToStore));
          localStorage.setItem('lastActivity', Date.now().toString());
          setIsLoading(false);
          resolve();
        } else {
          setIsLoading(false);
          reject(new Error('Invalid email or password.'));
        }
      }, 500);
    });
  };

  const signup = async (id: string, name: string, email: string, pass: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        if (mockUsers[email]) {
          setIsLoading(false);
          reject(new Error('An account with this email already exists.'));
          return;
        }

        if (Object.values(mockUsers).some(u => u.id === id)) {
          setIsLoading(false);
          reject(new Error('An account with this Employee ID already exists.'));
          return;
        }

        const passwordHash = await simpleHash(pass);

        const newUser: StoredUser = { id, name, email, role, passwordHash };
        const updatedUsers = { ...mockUsers, [email]: newUser };
        setMockUsers(updatedUsers);
        syncUsersToStorage(updatedUsers);

        const today = new Date().toISOString().split('T')[0];
        const newAttendanceRecord: AttendanceRecord = {
          employeeId: id,
          name: name,
          date: today,
          timeIn: '--:--',
          timeOut: '--:--',
          status: 'Not Marked',
        };
        const updatedAttendance = [...attendanceRecords, newAttendanceRecord];
        setAttendanceRecords(updatedAttendance);
        syncAttendanceToStorage(updatedAttendance);

        setIsLoading(false);
        resolve();
      }, 500);
    });
  };

  const getUsers = (): Omit<StoredUser, 'passwordHash'>[] => {
    return Object.values(mockUsers).map(({ passwordHash, ...user }) => user);
  };
  
  const importUsers = async (users: any[]): Promise<void> => {
      const newUsers: { [email: string]: StoredUser } = {};
      for (const u of users) {
          if (u.email && u.name && u.role && u.password && u.id) {
              newUsers[u.email] = {
                  ...u,
                  passwordHash: await simpleHash(u.password),
              };
              delete newUsers[u.email].password;
          }
      }
      setMockUsers(newUsers);
      syncUsersToStorage(newUsers);
  };

  const resetUsers = async (): Promise<void> => {
    const defaultUsers = await getDefaultUsers();
    setMockUsers(defaultUsers);
    syncUsersToStorage(defaultUsers);
    setAttendanceRecords(defaultAttendanceRecords);
    syncAttendanceToStorage(defaultAttendanceRecords);
  };

  const updateUser = async (email: string, data: Partial<Omit<User, 'email' | 'id'>>): Promise<void> => {
    if (mockUsers[email]) {
      const updatedUsers = {
        ...mockUsers,
        [email]: { ...mockUsers[email], ...data }
      };
      setMockUsers(updatedUsers);
      syncUsersToStorage(updatedUsers);
      if (user?.email === email) {
        const { passwordHash: _, ...userToStore } = updatedUsers[email];
        setUser(userToStore);
        localStorage.setItem('user', JSON.stringify(userToStore));
      }
    }
  };

  const deleteUser = async (email: string): Promise<void> => {
    const { [email]: _, ...remainingUsers } = mockUsers;
    setMockUsers(remainingUsers);
    syncUsersToStorage(remainingUsers);
  };
  

  const authContextValue: AuthContextType = { user, login, signup, logout, isLoading, getUsers, importUsers, resetUsers, updateUser, deleteUser, attendanceRecords };

  if (isLoading) {
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
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
