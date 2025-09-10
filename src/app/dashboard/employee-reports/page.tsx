
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
import { MoreHorizontal, Download, FilePlus, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useState, useMemo, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


const reportStages = ["Scanning", "Scanning Q-C", "PDF Pages", "PDF Q-C", "PDF Uploading", "Completed"];
const reportTypes = ["Pages", "Books"];


export default function EmployeeReportsPage() {
    const { user, employeeReports: reports, addEmployeeReport, updateEmployeeReport, deleteEmployeeReport } = useAuth();
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [newReportStage, setNewReportStage] = useState('');
    const [newReportType, setNewReportType] = useState('');
    const [newReportQuantity, setNewReportQuantity] = useState('');

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [editedStage, setEditedStage] = useState('');
    const [editedType, setEditedType] = useState('');
    const [editedQuantity, setEditedQuantity] = useState('');


    const employeeReports = useMemo(() => {
        if (user?.role === 'Employee') {
            return reports.filter(report => report.employeeId === user.id);
        }
        return reports;
    }, [user, reports]);

    const monthlyReports = useMemo(() => {
        const month = selectedDate.getMonth();
        const year = selectedDate.getFullYear();
        return employeeReports.filter(r => {
            const reportDate = new Date(r.submittedDate + 'T00:00:00');
            return reportDate.getMonth() === month && reportDate.getFullYear() === year;
        });
    }, [selectedDate, employeeReports]);

    const selectedMonthFormatted = selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
    });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Scanning Reports - ${selectedMonthFormatted}`, 14, 16);
    const head = [['Employee Name', 'Date Submitted', 'Stage', 'Type', 'Quantity']];
    const body = monthlyReports.map(r => [
        r.employeeName,
        new Date(r.submittedDate + 'T00:00:00').toLocaleDateString(),
        r.stage,
        r.type,
        r.quantity.toString(),
    ]);
    (doc as any).autoTable({
        head: head,
        body: body,
        startY: 20,
    });
    doc.save(`scanning_reports_${selectedDate.getFullYear()}_${selectedDate.getMonth() + 1}.pdf`);
  };

  const handleAddReport = () => {
    if (!newReportStage || !newReportType || !newReportQuantity) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Please select a stage, type, and enter a quantity.',
      });
      return;
    }
    
    const quantity = parseInt(newReportQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Please enter a valid quantity.',
      });
      return;
    }


    if (user) {
      addEmployeeReport({
        id: `REP-${Date.now()}`,
        employeeId: user.id,
        employeeName: user.name,
        submittedDate: new Date().toISOString().split('T')[0],
        stage: newReportStage,
        type: newReportType,
        quantity: quantity,
      });

      toast({
        title: 'Report Submitted',
        description: 'Your new report has been added.',
      });
      setNewReportStage('');
      setNewReportType('');
      setNewReportQuantity('');
    }
  };
  
    const handleEditClick = (report: any) => {
        setSelectedReport(report);
        setEditedStage(report.stage);
        setEditedType(report.type);
        setEditedQuantity(report.quantity.toString());
        setIsEditDialogOpen(true);
    };

    const handleUpdateReport = () => {
        if (selectedReport) {
            const quantity = parseInt(editedQuantity, 10);
            if (isNaN(quantity) || quantity <= 0) {
                toast({
                    variant: 'destructive',
                    title: 'Update Failed',
                    description: 'Please enter a valid quantity.',
                });
                return;
            }
            updateEmployeeReport(selectedReport.id, {
                stage: editedStage,
                type: editedType,
                quantity: quantity,
            });
            toast({
                title: 'Report Updated',
                description: 'The report has been successfully updated.',
            });
            setIsEditDialogOpen(false);
            setSelectedReport(null);
        }
    };

    const handleDeleteReport = (reportId: string) => {
        deleteEmployeeReport(reportId);
        toast({
            title: 'Report Deleted',
            description: 'The report has been successfully deleted.',
        });
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
                <TableHead>Quantity</TableHead>
                <TableHead className="hidden md:table-cell">Date Submitted</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user?.role === 'Employee' && (
                <TableRow>
                  <TableCell className="font-medium">{user?.name}</TableCell>
                  <TableCell>
                    <Select value={newReportStage} onValueChange={setNewReportStage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportStages.map(stage => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={newReportType} onValueChange={setNewReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                      <Input
                          type="number"
                          placeholder="e.g., 100"
                          value={newReportQuantity}
                          onChange={(e) => setNewReportQuantity(e.target.value)}
                      />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date().toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={handleAddReport}>
                      <FilePlus className="mr-2 h-4 w-4" /> Submit
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {monthlyReports.length > 0 ? (
                monthlyReports.map((report) => (
                    <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.employeeName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.stage}</Badge>
                    </TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.quantity}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        {new Date(report.submittedDate + 'T00:00:00').toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                        {user?.role === 'Admin' && (
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
                            <DropdownMenuItem onClick={() => handleEditClick(report)}>
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
                                        <AlertDialogTitle>Delete Report</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this report? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteReport(report.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        )}
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                user?.role !== 'Employee' && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground pt-8">
                        No scanning project reports found for this month.
                    </TableCell>
                </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
            <DialogDescription>
              Make changes to the report here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stage" className="text-right">Stage</Label>
              <Select onValueChange={setEditedStage} defaultValue={editedStage}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Stage" />
                </SelectTrigger>
                <SelectContent>
                  {reportStages.map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select onValueChange={setEditedType} defaultValue={editedType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">Quantity</Label>
                <Input
                    id="quantity"
                    type="number"
                    value={editedQuantity}
                    onChange={(e) => setEditedQuantity(e.target.value)}
                    className="col-span-3"
                />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleUpdateReport}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
