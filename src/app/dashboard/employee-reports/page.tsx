
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Download } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const allEmployeeReports = [
  {
    employeeId: 'EMP101',
    employeeName: 'Employee User',
    submittedDate: '2024-07-29',
    stage: 'Completed',
    type: 'Pages',
  },
  {
    employeeId: 'EMP001',
    employeeName: 'Ali Khan',
    submittedDate: '2024-07-28',
    stage: 'PDF Uploading',
    type: 'Pages',
  },
  {
    employeeId: 'EMP003',
    employeeName: 'Fatima Ali',
    submittedDate: '2024-07-27',
    stage: 'Scanning',
    type: 'Books',
  },
  {
    employeeId: 'EMP004',
    employeeName: 'Zainab Omar',
    submittedDate: '2024-07-26',
    stage: 'PDF Q-C',
    type: 'Pages',
  },
  {
    employeeId: 'EMP101',
    employeeName: 'Employee User',
    submittedDate: '2024-07-25',
    stage: 'Scanning Q-C',
    type: 'Books',
  },
  {
    employeeId: 'EMP101',
    employeeName: 'Employee User',
    submittedDate: '2024-06-15',
    stage: 'PDF Pages',
    type: 'Books',
  }
];


export default function EmployeeReportsPage() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const employeeReports = useMemo(() => {
        if (user?.role === 'Employee') {
            return allEmployeeReports.filter(report => report.employeeId === user.id);
        }
        return allEmployeeReports;
    }, [user]);

    const monthlyReports = useMemo(() => {
        const month = selectedDate.getMonth();
        const year = selectedDate.getFullYear();
        return employeeReports.filter(r => {
            const reportDate = new Date(r.submittedDate + 'T00:00:00');
            return reportDate.getMonth() === month && reportDate.getFullYear() === year;
        });
    }, [selectedDate, employeeReports]);

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

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 16 }, (_, i) => currentYear + 5 - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i, name: new Date(0, i).toLocaleString('en-US', { month: 'long' }) }));

    const selectedMonthFormatted = selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
    });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Scanning Reports - ${selectedMonthFormatted}`, 14, 16);
    const head = [['Employee Name', 'Date Submitted', 'Stage', 'Type']];
    const body = monthlyReports.map(r => [
        r.employeeName,
        new Date(r.submittedDate + 'T00:00:00').toLocaleDateString(),
        r.stage,
        r.type,
    ]);
    (doc as any).autoTable({
        head: head,
        body: body,
        startY: 20,
    });
    doc.save(`scanning_reports_${selectedDate.getFullYear()}_${selectedDate.getMonth() + 1}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Scanning Reports</h1>
            <p className="text-muted-foreground mt-2">
              Viewing reports for <span className="font-semibold text-primary">{selectedMonthFormatted}</span>
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

      <Card>
        <CardHeader>
          <CardTitle>Submitted Reports</CardTitle>
          <CardDescription>
            A list of all reports related to the scanning project for the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Report Stage</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Date Submitted</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyReports.length > 0 ? (
                monthlyReports.map((report) => (
                    <TableRow key={report.employeeId + report.submittedDate}>
                    <TableCell className="font-medium">{user?.role === 'Employee' ? user.name : report.employeeName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.stage}</Badge>
                    </TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        {new Date(report.submittedDate + 'T00:00:00').toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Report</DropdownMenuItem>
                            <DropdownMenuItem>Download</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No scanning project reports found for this month.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
