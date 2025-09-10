
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
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const allEmployeeReports = [
  {
    employeeId: 'EMP101',
    employeeName: 'Employee User',
    reportTitle: 'Weekly Sales Summary',
    submittedDate: '2024-07-29',
  },
  {
    employeeId: 'EMP001',
    employeeName: 'Ali Khan',
    reportTitle: 'I.T Department Monthly Update',
    submittedDate: '2024-07-28',
  },
  {
    employeeId: 'EMP003',
    employeeName: 'Fatima Ali',
    reportTitle: 'Scanning Project Progress',
    submittedDate: '2024-07-27',
  },
  {
    employeeId: 'EMP004',
    employeeName: 'Zainab Omar',
    reportTitle: 'Library Acquisition Proposal',
    submittedDate: '2024-07-26',
  },
];

const employeeReports = allEmployeeReports.filter(report => 
    report.reportTitle.toLowerCase().includes('scanning')
);


export default function EmployeeReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employee Reports</h1>
        <p className="text-muted-foreground mt-2">
          View reports submitted by employees.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Reports</CardTitle>
          <CardDescription>
            A list of all reports related to the scanning project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Report Title</TableHead>
                <TableHead className="hidden md:table-cell">Date Submitted</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeReports.length > 0 ? (
                employeeReports.map((report) => (
                    <TableRow key={report.employeeId + report.submittedDate}>
                    <TableCell className="font-medium">{report.employeeName}</TableCell>
                    <TableCell>{report.reportTitle}</TableCell>
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
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No scanning project reports found.
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
