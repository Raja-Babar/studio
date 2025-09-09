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

const getChartData = (records: AttendanceRecord[]) => {
    const counts = records.reduce((acc, record) => {
        const status = record.status as AttendanceStatus;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<AttendanceStatus, number>);

    return [
        { status: 'Present', count: counts.Present || 0 },
        { status: 'Absent', count: counts.Absent || 0 },
        { status: 'Leave', count: counts.Leave || 0 },
    ];
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

  const chartData = getChartData(displayedRecords);
  const selectedDateFormatted = selectedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
                    <CardTitle>Summary for {selectedDateFormatted}</CardTitle>
                    <CardDescription>A quick overview of attendance for the selected day.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="status" />
                            <YAxis allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    background: "hsl(var(--card))",
                                    borderColor: "hsl(var(--border))",
                                    color: "hsl(var(--card-foreground))"
                                }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="hsl(var(--primary))" name="Employees" />
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
