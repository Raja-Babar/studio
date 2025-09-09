
// src/app/dashboard/attendance/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { attendanceRecords } from '@/lib/placeholder-data';
import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AttendanceStatus = 'Present' | 'Absent' | 'Leave';

type MonthlySummary = {
  [employeeName: string]: {
    present: number;
    absent: number;
    leave: number;
    workingDays: number;
  };
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

const getWorkingDaysInMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
            workingDays++;
        }
    }
    return workingDays;
};


export default function AttendancePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const isEmployee = user?.role === 'Employee';

  const userAttendanceRecords = useMemo(() => {
    if (isEmployee) {
      return attendanceRecords.filter(r => r.name === user.name);
    }
    return attendanceRecords;
  }, [isEmployee, user?.name]);

  const monthlyRecords = useMemo(() => {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();
    return userAttendanceRecords.filter(r => {
        const recordDate = new Date(r.date + 'T00:00:00');
        return recordDate.getMonth() === month && recordDate.getFullYear() === year;
    });
  }, [selectedDate, userAttendanceRecords]);

  const monthlySummary: MonthlySummary = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const workingDays = getWorkingDaysInMonth(year, month);

    return monthlyRecords.reduce((acc: MonthlySummary, record) => {
      if (!acc[record.name]) {
        acc[record.name] = { present: 0, absent: 0, leave: 0, workingDays: workingDays };
      }
      const status = record.status.toLowerCase() as keyof Omit<MonthlySummary[string], 'workingDays'>;
      if (status in acc[record.name]) {
        acc[record.name][status]++;
      }
      return acc;
    }, {});
  }, [monthlyRecords, selectedDate]);


  const displayedRecords = useMemo(() => {
    return monthlyRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlyRecords]);

  const selectedMonthFormatted = selectedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  const handleMonthChange = (month: string) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(month, 10));
    newDate.setDate(1); // Set to the first day of the month to avoid issues
    setSelectedDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(year, 10));
    newDate.setDate(1); // Set to the first day of the month to avoid issues
    setSelectedDate(newDate);
  };

  const years = Array.from(new Set(attendanceRecords.map(r => new Date(r.date).getFullYear()))).sort((a,b) => b-a);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i, name: new Date(0, i).toLocaleString('en-US', { month: 'long' }) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground mt-2">View and manage employee attendance records.</p>
        </div>
        <div className="flex gap-2">
            <Select onValueChange={handleMonthChange} defaultValue={selectedDate.getMonth().toString()}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                    {months.map(month => (
                        <SelectItem key={month.value} value={month.value.toString()}>{month.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select onValueChange={handleYearChange} defaultValue={selectedDate.getFullYear().toString()}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>Total attendance summary for {selectedMonthFormatted}.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead className="text-center">Working Days</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Leave</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {Object.entries(monthlySummary).length > 0 ? (
                    Object.entries(monthlySummary).map(([name, summary]) => (
                    <TableRow key={name}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell className="text-center">{summary.workingDays}</TableCell>
                        <TableCell className="text-center">{summary.present}</TableCell>
                        <TableCell className="text-center">{summary.absent}</TableCell>
                        <TableCell className="text-center">{summary.leave}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">No summary data for this month.</TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
            <CardTitle>Detailed Records</CardTitle>
            <CardDescription>All attendance entries for {selectedMonthFormatted}.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time In</TableHead>
                    <TableHead>Time Out</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {displayedRecords.length > 0 ? (
                    displayedRecords.map((record, index) => (
                        <TableRow key={`${record.employeeId}-${record.date}-${index}`}>
                        <TableCell className="font-medium">{record.name}</TableCell>
                        <TableCell>{new Date(record.date  + 'T00:00:00').toLocaleDateString()}</TableCell>
                        <TableCell>{record.timeIn}</TableCell>
                        <TableCell>{record.timeOut}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(record.status as AttendanceStatus)}>
                            {record.status}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">No attendance records for this month.</TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
