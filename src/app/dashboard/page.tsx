'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Briefcase, DollarSign, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleMarkAttendance = () => {
    toast({
      title: 'Attendance Marked',
      description: `Your attendance for today has been recorded.`,
    });
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}!</h1>
      {user.role === 'Admin' ? (
        <AdminDashboard />
      ) : (
        <EmployeeDashboard onMarkAttendance={handleMarkAttendance} />
      )}
    </div>
  );
}

function AdminDashboard() {
  const stats = [
    { title: 'Total Employees', value: '42', icon: Users },
    { title: 'Projects Ongoing', value: '5', icon: Briefcase },
    { title: 'Monthly Salaries', value: '$25,600', icon: DollarSign },
    { title: 'Scanning Progress', value: '75%', icon: BarChart },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>
       <Card className="mt-6">
          <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activities to display.</p>
          </CardContent>
       </Card>
    </div>
  );
}

function EmployeeDashboard({ onMarkAttendance }: { onMarkAttendance: () => void }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>My Attendance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <p className="text-muted-foreground">Mark your attendance for today.</p>
          <Button onClick={onMarkAttendance}>Mark Present</Button>
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
