
// src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Briefcase, DollarSign, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl font-bold tracking-tight">Welcome, {user.name}!</h1>
      {user.role === 'Admin' ? (
        <AdminDashboard />
      ) : (
        <EmployeeDashboard />
      )}
    </div>
  );
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Generated':
      return 'default';
    case 'Approved':
      return 'secondary';
    case 'In Review':
      return 'outline';
    case 'Draft':
        return 'destructive'
    default:
      return 'outline';
  }
};


function AdminDashboard() {
  const { getUsers } = useAuth();
  const totalEmployees = getUsers().length;

  const stats = [
    { title: 'Total Employees', value: totalEmployees.toString(), icon: Users, href: '/dashboard/user-management', subtext: "+5.1% from last month" },
    { title: 'Projects Ongoing', value: '5', icon: Briefcase, subtext: "+1 from last month" },
    { title: 'Salaries Record', value: null, icon: DollarSign, href: '/dashboard/salaries', bold: true },
    { title: 'Scanning Progress', value: '75%', icon: BarChart, subtext: "+2.1% from last month" },
  ];

  const reportStages = [
    { name: 'Q2 Financial Summary', stage: 'Generated', nextAction: 'N/A' },
    { name: 'Employee Attendance Analysis', stage: 'Approved', nextAction: 'Generation Pending' },
    { name: 'Scanning Project Progress', stage: 'In Review', nextAction: '2024-08-10' },
    { name: 'Annual User Activity Report', stage: 'Draft', nextAction: '2024-08-05' },
  ];


  return (
    <div>
      <h2 className="text-3xl font-semibold mb-4">Admin Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
            const cardContent = (
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-base font-medium ${stat.bold ? 'font-bold' : ''}`}>{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stat.value || <>&nbsp;</>}</div>
                    <p className="text-sm text-muted-foreground h-4">{stat.subtext || ''}</p>
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
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
            <CardHeader>
                <CardTitle>Report Status</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Report Name</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Next Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportStages.map((report) => (
                            <TableRow key={report.name}>
                                <TableCell className="font-medium">{report.name}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(report.stage)}>
                                        {report.stage}
                                    </Badge>
                                </TableCell>
                                <TableCell>{report.nextAction}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent activities to display.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmployeeDashboard() {
  const { user, attendanceRecords, updateAttendance } = useAuth();
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];
  const todaysRecord = attendanceRecords.find(r => r.employeeId === user?.id && r.date === today);

  const timeIn = todaysRecord?.timeIn || '--:--';
  const timeOut = todaysRecord?.timeOut || '--:--';
  
  const hasClockedIn = timeIn !== '--:--';
  const hasClockedOut = timeOut !== '--:--';


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
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>My Attendance</CardTitle>
          <p className="text-muted-foreground">Clock in and out for today.</p>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
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
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You have no assigned tasks.</p>
        </CardContent>
      </Card>
    </div>
  );
}
