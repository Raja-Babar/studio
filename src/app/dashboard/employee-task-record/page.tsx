// src/app/dashboard/employee-task-record/page.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { scanningProgressRecords as scanningProgressRecordsJSON } from '@/lib/placeholder-data';
import { Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

type ScanningRecord = {
  book_id: string;
  title_english: string;
  status: string;
  assigned_to: string | null;
  assigned_date: string | null;
  assigned_time: string | null;
};

const getStatusClasses = (status: string) => {
  switch (status?.toLowerCase()) {
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

export default function EmployeeTaskRecordPage() {
  const [scanningRecords, setScanningRecords] = useState<ScanningRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    try {
      const storedRecords = localStorage.getItem('scanningProgressRecords');
      setScanningRecords(storedRecords ? JSON.parse(storedRecords) : JSON.parse(scanningProgressRecordsJSON));
    } catch (e) {
      setScanningRecords(JSON.parse(scanningProgressRecordsJSON));
    }
  }, []);
  
  const assignedTasks = useMemo(() => {
      const allAssigned = scanningRecords.filter(record => record.assigned_to);

      if (user?.role === 'I.T & Scanning-Employee') {
        return allAssigned.filter(record => record.assigned_to === user.name);
      }

      return allAssigned;
  }, [scanningRecords, user]);

  const filteredTasks = useMemo(() => {
    return assignedTasks.filter(task => {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = task.title_english.toLowerCase().includes(searchLower);
      
      if (user?.role === 'Admin') {
        return titleMatch || task.assigned_to?.toLowerCase().includes(searchLower);
      }
      
      return titleMatch;
    }).sort((a, b) => {
        const dateA = a.assigned_date ? new Date(a.assigned_date).getTime() : 0;
        const dateB = b.assigned_date ? new Date(b.assigned_date).getTime() : 0;
        return dateB - dateA;
    });
  }, [assignedTasks, searchTerm, user]);
  
  const handleExportPDF = () => {
    if (filteredTasks.length === 0) {
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: "There are no tasks to export."
        });
        return;
    }
    const doc = new jsPDF();
    doc.text('Employee Assigned Tasks Report', 14, 16);
    (doc as any).autoTable({
        head: [['Book Title', 'Assigned To', 'Assigned At', 'Status']],
        body: filteredTasks.map(task => [
            task.title_english,
            task.assigned_to,
            task.assigned_date ? `${task.assigned_date} ${task.assigned_time}` : 'N/A',
            task.status
        ]),
        startY: 22,
    });
    doc.save('employee_tasks_report.pdf');
    toast({
        title: "Export Successful",
        description: "The task list has been exported to PDF."
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employee Task Records</h1>
        <p className="text-muted-foreground mt-2">A log of all tasks assigned to employees.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
            <div className="flex-1 w-full">
              <CardTitle>Assigned Task List</CardTitle>
              <CardDescription>
                View and search all assigned tasks.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto flex-col sm:flex-row">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={user?.role === 'Admin' ? "Search tasks or employees..." : "Search tasks..."}
                  className="w-full rounded-lg bg-background pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleExportPDF} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Title</TableHead>
                {user?.role === 'Admin' && <TableHead>Assigned To</TableHead>}
                <TableHead>Assigned At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TableRow key={task.book_id}>
                    <TableCell className="font-medium">{task.title_english}</TableCell>
                    {user?.role === 'Admin' && <TableCell>{task.assigned_to}</TableCell>}
                    <TableCell>
                      {task.assigned_date ? `${task.assigned_date} ${task.assigned_time}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusClasses(task.status)}>{task.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={user?.role === 'Admin' ? 4 : 3} className="h-24 text-center">
                    No assigned tasks found.
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
