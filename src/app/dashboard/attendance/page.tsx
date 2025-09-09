
// src/app/dashboard/attendance/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { attendanceRecords } from '@/lib/placeholder-data';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
type AttendanceRecord = {
    employeeId: string;
    name: string;
    date: string;
    time: string;
    status: string;
};

const getStatusVariant = (status: AttendanceStatus) => {
  switch (status) {
    case 'Present':
      return 'default';
    case 'Absent':
      return 'destructive';
    case 'Leave':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getMonthlyProgressData = (records: AttendanceRecord[], selectedDate: Date) => {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    const monthlyRecords = records.filter(record => {
        const recordDate = new Date(record.date + 'T00:00:00'); // Use T00:00:00 to avoid timezone issues
        return recordDate.getMonth() === month && recordDate.getFullYear() === year;
    });

    const employeeProgress = monthlyRecords.reduce((acc, record) => {
        if (record.status === 'Present') {
            acc[record.name] = (acc[record.name] || 0) + 1;
        } else if (!acc[record.name]) {
            acc[record.name] = 0;
        }
        return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(employeeProgress).map(([name, presentDays]) => ({
        name,
        presentDays,
    })).sort((a, b) => b.presentDays - a.presentDays);
};


export default function AttendancePage() {
  const { user } = useAuth();
  const [currentDate] = useState<Date>(new Date());
  const [displayedRecords, setDisplayedRecords] = useState<AttendanceRecord[]>([]);

  const isEmployee = user?.role === 'Employee';

  const userAttendanceRecords = useMemo(() => {
    if (isEmployee) {
      return attendanceRecords.filter(r => r.name === user.name);
    }
    return attendanceRecords;
  }, [isEmployee, user?.name]);

  useEffect(() => {
    const timezoneOffset = currentDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(currentDate.valueOf() - timezoneOffset)).toISOString().slice(0, 10);
    setDisplayedRecords(userAttendanceRecords.filter(r => r.date === localISOTime));
  }, [currentDate, userAttendanceRecords]);

  const monthlyProgressData = getMonthlyProgressData(userAttendanceRecords, currentDate);
  const currentDateFormatted = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const currentMonthFormatted = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-2">View and manage employee attendance records.</p>
      </div>
      
      <div className="grid gap-6">
        <div>
            <Card>
                <CardHeader>
                <CardTitle>Detailed Records</CardTitle>
                <CardDescription>All attendance entries for {currentDateFormatted}.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {displayedRecords.length > 0 ? (
                        displayedRecords.map((record, index) => (
                            <TableRow key={`${record.employeeId}-${record.date}-${index}`}>
                            <TableCell className="font-medium">{record.name}</TableCell>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.time}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(record.status as AttendanceStatus)}>
                                {record.status}
                                </Badge>
                            </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">No attendance records for this day.</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Monthly Progress for {currentMonthFormatted}</CardTitle>
                    <CardDescription>Total days each employee was present in the current month.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyProgressData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                            <YAxis allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    background: "hsl(var(--card))",
                                    borderColor: "hsl(var(--border))",
                                    color: "hsl(var(--card-foreground))"
                                }}
                            />
                            <Legend />
                            <Bar dataKey="presentDays" fill="hsl(var(--primary))" name="Present Days" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
