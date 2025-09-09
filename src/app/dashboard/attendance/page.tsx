// src/app/dashboard/attendance/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { attendanceRecords } from '@/lib/placeholder-data';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/hooks/use-auth';

type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
type AttendanceRecord = {
    employeeId: string;
    name: string;
    date: string;
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
        const recordDate = new Date(record.date + 'T00:00:00');
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayedRecords, setDisplayedRecords] = useState<AttendanceRecord[]>([]);

  const isEmployee = user?.role === 'Employee';

  const userAttendanceRecords = useMemo(() => {
    if (isEmployee) {
      return attendanceRecords.filter(r => r.name === user.name);
    }
    return attendanceRecords;
  }, [isEmployee, user?.name]);

  useEffect(() => {
    const timezoneOffset = selectedDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(selectedDate.valueOf() - timezoneOffset)).toISOString().slice(0, 10);
    setDisplayedRecords(userAttendanceRecords.filter(r => r.date === localISOTime));
  }, [selectedDate, userAttendanceRecords]);

  const monthlyProgressData = getMonthlyProgressData(userAttendanceRecords, selectedDate);
  const selectedDateFormatted = selectedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const selectedMonthFormatted = selectedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });


  const markedDays = useMemo(() => {
    // We need to parse the date strings as UTC to avoid timezone issues with `new Date()`
    return userAttendanceRecords.map(r => new Date(r.date + 'T00:00:00'));
  }, [userAttendanceRecords]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-2">View and manage employee attendance records.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>Detailed Records</CardTitle>
                <CardDescription>All attendance entries for {selectedDateFormatted}.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {displayedRecords.length > 0 ? (
                        displayedRecords.map((record, index) => (
                            <TableRow key={`${record.employeeId}-${record.date}-${index}`}>
                            <TableCell className="font-medium">{record.name}</TableCell>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(record.status as AttendanceStatus)}>
                                {record.status}
                                </Badge>
                            </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">No attendance records for this day.</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Monthly Progress for {selectedMonthFormatted}</CardTitle>
                    <CardDescription>Total days each employee was present in the selected month.</CardDescription>
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
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                    <CardDescription>Select a day to view records. Marked days have attendance logs.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(day) => day && setSelectedDate(day)}
                        modifiers={{ marked: markedDays }}
                        modifiersStyles={{
                            marked: { 
                                border: "2px solid hsl(var(--primary))",
                                borderRadius: 'var(--radius)'
                            },
                        }}
                        className="p-0"
                    />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
