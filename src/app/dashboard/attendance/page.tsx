'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { attendanceRecords } from '@/lib/placeholder-data';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';

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
  const [todaysRecords, setTodaysRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today.valueOf() - timezoneOffset)).toISOString().slice(0, 10);
    setTodaysRecords(attendanceRecords.filter(r => r.date === localISOTime));
  }, []);

  const chartData = getChartData(todaysRecords);
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-2">View and manage employee attendance records.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
            <CardDescription>A quick overview of attendance for {todayFormatted}.</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>Detailed Records</CardTitle>
          <CardDescription>All attendance entries for {todayFormatted}.</CardDescription>
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
              {todaysRecords.length > 0 ? (
                todaysRecords.map((record, index) => (
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
                    <TableCell colSpan={3} className="text-center">No attendance records for today.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
