
// src/app/dashboard/attendance/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { attendanceRecords } from '@/lib/placeholder-data';
import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add Detailed Records
    doc.text(`Detailed Attendance Records - ${selectedMonthFormatted}`, 14, 16);
    (doc as any).autoTable({
        head: [['Employee Name', 'Date', 'Time In', 'Time Out', 'Status']],
        body: displayedRecords.map(r => [
            r.name, 
            new Date(r.date + 'T00:00:00').toLocaleDateString(), 
            r.timeIn, 
            r.timeOut, 
            r.status
        ]),
        startY: 20,
        didDrawPage: function (data) {
            // Header
            doc.setFontSize(20);
            doc.setTextColor(40);
        },
    });

    // Add a new page for the summary
    doc.addPage();

    // Add Summary Records
    doc.text(`Monthly Attendance Summary - ${selectedMonthFormatted}`, 14, 16);
    (doc as any).autoTable({
        head: [['Employee Name', 'Working Days', 'Present', 'Absent', 'Leave']],
        body: Object.entries(monthlySummary).map(([name, summary]) => [
            name,
            summary.workingDays,
            summary.present,
            summary.absent,
            summary.leave
        ]),
        startY: 20,
        didDrawPage: function (data) {
            // Header
            doc.setFontSize(20);
            doc.setTextColor(40);
        },
    });

    doc.save(`attendance_report_${selectedDate.getFullYear()}_${selectedDate.getMonth() + 1}.pdf`);
};


  return (
    <div className="space-y-6">
      <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground mt-2">
            Viewing records for <span className="font-semibold text-primary">{selectedMonthFormatted}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <Select onValueChange={handleMonthChange} defaultValue={selectedDate.getMonth().toString()}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                    {months.map(month => (
                        <SelectItem key={month.value} value={month.value.toString()}>{month.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select onValueChange={handleYearChange} defaultValue={selectedDate.getFullYear().toString()}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
             <Button variant="outline" size="sm" onClick={handleExportPDF} className="w-full">
                <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Detailed Records</CardTitle>
                <CardDescription>All attendance entries for the selected period.</CardDescription>
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
