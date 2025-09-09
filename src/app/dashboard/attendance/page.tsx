
// src/app/dashboard/attendance/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

type AttendanceStatus = 'Present' | 'Absent' | 'Leave' | 'Not Marked';

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

export default function AttendancePage() {
  const { user, attendanceRecords, markAttendance } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [_, setForceRender] = useState(false); // To force re-render on state change

  const isEmployee = user?.role === 'Employee';

  const userAttendanceRecords = useMemo(() => {
    const records = attendanceRecords;
    if (isEmployee) {
      return records.filter(r => r.name === user.name);
    }
    return records;
  }, [isEmployee, user?.name, attendanceRecords]);
  
  const monthlyRecords = useMemo(() => {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();
    return userAttendanceRecords.filter(r => {
        const recordDate = new Date(r.date + 'T00:00:00');
        return recordDate.getMonth() === month && recordDate.getFullYear() === year;
    });
  }, [selectedDate, userAttendanceRecords]);

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
    newDate.setDate(1); 
    setSelectedDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(year, 10));
    newDate.setDate(1);
    setSelectedDate(newDate);
  };

  const years = Array.from(new Set(attendanceRecords.map(r => new Date(r.date).getFullYear()))).sort((a,b) => b-a);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i, name: new Date(0, i).toLocaleString('en-US', { month: 'long' }) }));

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.text(`Daily Attendance - ${selectedMonthFormatted}`, 14, 16);
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
            doc.setFontSize(20);
            doc.setTextColor(40);
        },
    });

    doc.save(`attendance_report_${selectedDate.getFullYear()}_${selectedDate.getMonth() + 1}.pdf`);
};

  const handleClockIn = (employeeId: string, date: string) => {
    markAttendance(employeeId, date, 'timeIn');
    toast({ title: 'Clocked In', description: 'Your arrival time has been recorded.' });
    setForceRender(prev => !prev);
  };

  const handleClockOut = (employeeId: string, date: string) => {
    markAttendance(employeeId, date, 'timeOut');
    toast({ title: 'Clocked Out', description: 'Your departure time has been recorded.' });
    setForceRender(prev => !prev);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
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
                </Trigger>
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
                <CardTitle>Daily Attendance</CardTitle>
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
                    displayedRecords.map((record) => {
                      const canClockIn = isEmployee && isToday(new Date(record.date  + 'T00:00:00')) && record.timeIn === '--:--';
                      const canClockOut = isEmployee && isToday(new Date(record.date + 'T00:00:00')) && record.timeIn !== '--:--' && record.timeOut === '--:--';

                      return (
                        <TableRow key={`${record.employeeId}-${record.date}`}>
                            <TableCell className="font-medium">{record.name}</TableCell>
                            <TableCell>{new Date(record.date  + 'T00:00:00').toLocaleDateString()}</TableCell>
                            <TableCell>
                                {canClockIn ? (
                                    <Button size="sm" onClick={() => handleClockIn(record.employeeId, record.date)}>Clock In</Button>
                                ) : (
                                    record.timeIn
                                )}
                            </TableCell>
                            <TableCell>
                                {canClockOut ? (
                                    <Button size="sm" variant="outline" onClick={() => handleClockOut(record.employeeId, record.date)}>Clock Out</Button>
                                ) : (
                                    record.timeOut
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(record.status as AttendanceStatus)}>
                                {record.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                      )
                    })
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No attendance records for this month.
                        </TableCell>
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
