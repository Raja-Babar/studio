
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
    reportTitle: 'Weekly Sales Summary',
    submittedDate: '2024-07-29',
    stage: 'Completed',
    booksScanned: 0,
  },
  {
    employeeId: 'EMP001',
    employeeName: 'Ali Khan',
    reportTitle: 'I.T Department Monthly Update',
    submittedDate: '2024-07-28',
    stage: 'Uploading',
    booksScanned: 0,
  },
  {
    employeeId: 'EMP003',
    employeeName: 'Fatima Ali',
    reportTitle: 'Scanning Project Progress',
    submittedDate: '2024-07-27',
    stage: 'Scanning',
    booksScanned: 15,
  },
  {
    employeeId: 'EMP004',
    employeeName: 'Zainab Omar',
    reportTitle: 'Library Acquisition Proposal',
    submittedDate: '2024-07-26',
    stage: 'PDF-QC',
    booksScanned: 0,
  },
  {
    employeeId: 'EMP101',
    employeeName: 'Employee User',
    reportTitle: 'Scanning Project Quarterly Review',
    submittedDate: '2024-07-25',
    stage: 'Scanning',
    booksScanned: 5,
  },
  {
    employeeId: 'EMP101',
    employeeName: 'Employee User',
    reportTitle: 'Scanning Report June',
    submittedDate: '2024-06-15',
    stage: 'Completed',
    booksScanned: 10,
  }
];


export default function EmployeeReportsPage() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const employeeReports = useMemo(() => {
        return allEmployeeReports.filter(report => {
            const isScanningReport = report.reportTitle.toLowerCase().includes('scanning');
            if (!isScanningReport) return false;

            if (user?.role === 'Employee') {
                return report.employeeId === user.id;
            }
            
            return true;
        });
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
    const head = [['Employee Name', 'Report Title', 'Date Submitted', 'Stage', 'Books Scanned']];
    const body = monthlyReports.map(r => [
        r.employeeName,
        r.reportTitle,
        new Date(r.submittedDate + 'T00:00:00').toLocaleDateString(),
        r.stage,
        r.booksScanned.toString()
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
                <TableHead>Report Title</TableHead>
                <TableHead>Report Stage</TableHead>
                <TableHead>Books Scanned</TableHead>
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
                    <TableCell>{report.reportTitle}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.stage}</Badge>
                    </TableCell>
                    <TableCell>{report.booksScanned}</TableCell>
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
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
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
