
// src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Briefcase, DollarSign, Users, Clock, ArrowRight, FilePlus } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { scanningProgressRecords as scanningProgressRecordsJSON } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';

type ScanningRecord = {
  book_id: string;
  title: string;
  status: string;
  scanner: string | null;
  qc_by: string | null;
  updated_at: string;
};

const getStatusClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-primary text-primary-foreground hover:bg-primary/80';
    case 'uploading':
      return 'bg-[hsl(var(--chart-2))] text-black hover:bg-[hsl(var(--chart-2))]';
    case 'scanning':
      return 'text-foreground border-foreground/50';
    case 'pdf-qc':
      return 'bg-primary/80 text-primary-foreground hover:bg-primary/70';
    case 'scanning-qc':
      return 'bg-destructive text-destructive-foreground hover:bg-destructive/80';
    case 'page cleaning+cropping':
       return 'text-foreground border-foreground/50';
    case 'pending':
        return 'bg-yellow-500 text-black hover:bg-yellow-500/80';
    default:
      return 'text-foreground border-foreground/50';
  }
};


export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}!</h1>
      {user.role === 'Admin' ? (
        <AdminDashboard />
      ) : (
        <EmployeeDashboard />
      )}
    </div>
  );
}

const getStageBadgeClass = (stage: string) => {
    switch (stage.toLowerCase()) {
        case 'completed':
            return 'bg-green-600 text-white';
        case 'scanning':
            return 'bg-blue-500 text-white';
        case 'scanning q-c':
            return 'bg-yellow-500 text-black';
        case 'pdf pages':
            return 'bg-purple-500 text-white';
        case 'pdf q-c':
            return 'bg-orange-500 text-white';
        case 'pdf uploading':
            return 'bg-teal-500 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
};


function AdminDashboard() {
  const { getUsers } = useAuth();
  const totalEmployees = getUsers().length;
  const scanningRecords: ScanningRecord[] = useMemo(() => JSON.parse(scanningProgressRecordsJSON), []);
  const recentScanningActivity = useMemo(() => {
    return scanningRecords
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [scanningRecords]);

  const stats = [
    { title: 'Total Employees', value: totalEmployees.toString(), icon: Users, href: '/dashboard/user-management', subtext: "+5.1% from last month" },
    { title: 'Projects Ongoing', value: '5', icon: Briefcase, subtext: "+1 from last month" },
    { title: 'Salaries Record', value: null, icon: DollarSign, href: '/dashboard/salaries', bold: true },
    { title: 'Digitization Progress', value: '75%', icon: BarChart, href: '/dashboard/scanning', subtext: "+2.1% from last month" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
            const cardContent = (
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${stat.bold ? 'font-bold' : ''}`}>{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stat.value || <>&nbsp;</>}</div>
                    <p className="text-xs text-muted-foreground h-4">{stat.subtext || ''}</p>
                    </CardContent>
                </Card>
            );

            if (stat.href) {
                return (
                    <Link href={stat.href} key={stat.title}>
                       {cardContent}
                    </Link>
                )
            }
            return <div key={stat.title}>{cardContent}</div>;
        })}
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Digitization Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Scanner</TableHead>
                <TableHead className="hidden md:table-cell">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentScanningActivity.length > 0 ? (
                recentScanningActivity.map((record) => (
                  <TableRow key={record.book_id}>
                    <TableCell className="font-medium">{record.title}</TableCell>
                    <TableCell>
                      <Badge className={cn(getStatusClasses(record.status))}>{record.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{record.scanner || 'N/A'}</TableCell>
                     <TableCell className="hidden md:table-cell">{new Date(record.updated_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No recent scanning activity.
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

function EmployeeDashboard() {
  const { user, attendanceRecords, updateAttendance, employeeReports } = useAuth();
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];
  const todaysRecord = attendanceRecords.find(r => r.employeeId === user?.id && r.date === today);

  const timeIn = todaysRecord?.timeIn || '--:--';
  const timeOut = todaysRecord?.timeOut || '--:--';
  
  const hasClockedIn = timeIn !== '--:--';
  const hasClockedOut = timeOut !== '--:--';

  const userReports = useMemo(() => {
    if (user?.role === 'Employee') {
        return employeeReports.filter(report => report.employeeId === user.id).slice(0, 5); // Show latest 5
    }
    return [];
  }, [user, employeeReports]);


  const handleClockIn = () => {
    if (user) {
      updateAttendance(user.id, { clockIn: true });
      toast({
        title: "Clocked In",
        description: "Your arrival time has been recorded.",
      });
    }
  };
  
  const handleClockOut = () => {
    if (user) {
      updateAttendance(user.id, { clockOut: true });
       toast({
        title: "Clocked Out",
        description: "Your departure time has been recorded.",
      });
    }
  };


  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Attendance</CardTitle>
            <p className="text-sm text-muted-foreground">Clock in and out for today.</p>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
            <div className="w-full space-y-4">
              <div className="flex w-full gap-4">
                <Button onClick={handleClockIn} className="w-full" disabled={hasClockedIn}>
                    <Clock className="mr-2 h-4 w-4" />
                    Clock In
                </Button>
                <Button onClick={handleClockOut} className="w-full" variant="outline" disabled={!hasClockedIn || hasClockedOut}>
                    <Clock className="mr-2 h-4 w-4" />
                    Clock Out
                </Button>
              </div>
              <Table>
                  <TableHeader>
                      <TableRow>
                      <TableHead>Time In</TableHead>
                      <TableHead>Time Out</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      <TableRow>
                      <TableCell>{timeIn}</TableCell>
                      <TableCell>{timeOut}</TableCell>
                      </TableRow>
                  </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create Report</CardTitle>
            <p className="text-sm text-muted-foreground">Start a new report submission.</p>
          </CardHeader>
          <CardContent>
              <Link href="/dashboard/employee-reports">
                  <Button className="w-full">
                      <FilePlus className="mr-2 h-4 w-4" />
                      Create New Report
                  </Button>
              </Link>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
           <p className="text-sm text-muted-foreground">A list of your assigned reports and their current stages.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Title</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userReports.length > 0 ? (
                userReports.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{`${task.type} - ${task.quantity}`}</TableCell>
                    <TableCell>
                      <Badge className={cn(getStageBadgeClass(task.stage))}>{task.stage}</Badge>
                    </TableCell>
                    <TableCell>{new Date(task.submittedDate + 'T00:00:00').toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    You have no assigned tasks.
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
