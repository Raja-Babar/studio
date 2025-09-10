
// src/app/dashboard/attendance/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, MoreHorizontal, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { AttendanceRecord } from '@/context/auth-provider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


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
  const { user, attendanceRecords, updateAttendanceRecord, deleteAttendanceRecord, getUsers } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [editedTimeIn, setEditedTimeIn] = useState('');
  const [editedTimeOut, setEditedTimeOut] = useState('');
  const [editedStatus, setEditedStatus] = useState<AttendanceStatus>('Not Marked');


  const isEmployee = user?.role === 'Employee';

  const userAttendanceRecords = useMemo(() => {
    const supervisor = getUsers().find(u => u.email === 'supervisor@example.com');
    const records = attendanceRecords.filter(r => r.employeeId !== supervisor?.id);
    if (isEmployee && user) {
      return records.filter(r => r.employeeId === user.id);
    }
    return records;
  }, [isEmployee, user, attendanceRecords, getUsers]);

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

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.text(`Daily Attendance - ${selectedMonthFormatted}`, 14, 16);
    const head = isEmployee ? [['Date', 'Time In', 'Time Out', 'Status']] : [['Employee Name', 'Date', 'Time In', 'Time Out', 'Status']];
    const body = displayedRecords.map(r => {
        const row = [
            new Date(r.date + 'T00:00:00').toLocaleDateString(),
            r.timeIn,
            r.timeOut,
            r.status
        ];
        if (!isEmployee) {
            row.unshift(r.name);
        }
        return row;
    });


    (doc as any).autoTable({
        head: head,
        body: body,
        startY: 20,
        didDrawPage: function (data) {
            doc.setFontSize(20);
            doc.setTextColor(40);
        },
    });

    doc.save(`attendance_report_${selectedDate.getFullYear()}_${selectedDate.getMonth() + 1}.pdf`);
  };
  
    const handleEditClick = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setEditedTimeIn(record.timeIn);
        setEditedTimeOut(record.timeOut);
        setEditedStatus(record.status as AttendanceStatus);
        setIsEditDialogOpen(true);
    };

    const handleUpdateRecord = () => {
        if (selectedRecord) {
            updateAttendanceRecord(selectedRecord.employeeId, selectedRecord.date, {
                timeIn: editedTimeIn,
                timeOut: editedTimeOut,
                status: editedStatus,
            });
            toast({
                title: 'Record Updated',
                description: 'The attendance record has been successfully updated.',
            });
            setIsEditDialogOpen(false);
            setSelectedRecord(null);
        }
    };

    const handleDeleteRecord = (employeeId: string, date: string) => {
        deleteAttendanceRecord(employeeId, date);
        toast({
            title: 'Record Deleted',
            description: 'The attendance record has been successfully deleted.',
        });
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
                    {!isEmployee && <TableHead><span className="sr-only">Actions</span></TableHead>}
                </TableRow>
                </TableHeader>
                <TableBody>
                {displayedRecords.length > 0 ? (
                    displayedRecords.map((record) => (
                        <TableRow key={`${record.employeeId}-${record.date}`}>
                            <TableCell className="font-medium">{isEmployee ? user?.name : record.name}</TableCell>
                            <TableCell>{new Date(record.date  + 'T00:00:00').toLocaleDateString()}</TableCell>
                            <TableCell>{record.timeIn}</TableCell>
                            <TableCell>{record.timeOut}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(record.status as AttendanceStatus)}>
                                {record.status}
                                </Badge>
                            </TableCell>
                            {!isEmployee && (
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleEditClick(record)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                        <span className="text-destructive">Delete</span>
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Record</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete this attendance record? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteRecord(record.employeeId, record.date)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            )}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                       {isEmployee && user ? (
                         <>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{new Date(selectedDate).toLocaleDateString()}</TableCell>
                          <TableCell>--:--</TableCell>
                          <TableCell>--:--</TableCell>
                          <TableCell>
                            <Badge variant="outline">Not Marked</Badge>
                          </TableCell>
                         </>
                       ) : (
                          <TableCell colSpan={isEmployee ? 5 : 6} className="text-center text-muted-foreground">
                              No attendance records for this month.
                          </TableCell>
                       )}
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </div>

       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
            <DialogDescription>
              Make changes to the record for <span className="font-semibold">{selectedRecord?.name}</span> on <span className="font-semibold">{selectedRecord ? new Date(selectedRecord.date + 'T00:00:00').toLocaleDateString() : ''}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeIn" className="text-right">Time In</Label>
              <Input id="timeIn" value={editedTimeIn} onChange={(e) => setEditedTimeIn(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="timeOut" className="text-right">Time Out</Label>
                <Input id="timeOut" value={editedTimeOut} onChange={(e) => setEditedTimeOut(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
               <Select onValueChange={(value) => setEditedStatus(value as AttendanceStatus)} defaultValue={editedStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                  <SelectItem value="Not Marked">Not Marked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleUpdateRecord}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
