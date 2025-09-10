
// src/app/dashboard/scanning/page.tsx
'use client';

import { useState } from 'react';
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
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type ScanningRecord = {
  book_id: string;
  title: string;
  status: string;
  scanner: string | null;
  qc_by: string | null;
  updated_at: string;
};

const initialScanningRecords: ScanningRecord[] = JSON.parse(scanningProgressRecordsJSON);

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'default';
    case 'uploaded':
      return 'secondary';
    case 'scanning':
      return 'outline';
    case 'pdf-qc':
      return 'default';
    case 'scanning-qc':
      return 'destructive';
    case 'page cleaning+cropping':
       return 'outline';
    default:
      return 'outline';
  }
};

const statusOptions = [
    "Scanning",
    "Scanning-QC",
    "Page Cleaning+Cropping",
    "PDF-QC",
    "Uploaded",
    "Completed"
];


export default function ScanningPage() {
  const [scanningRecords, setScanningRecords] = useState<ScanningRecord[]>(initialScanningRecords);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ScanningRecord | null>(null);
  const [editedStatus, setEditedStatus] = useState('');
  const { toast } = useToast();

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  const handleEditClick = (record: ScanningRecord) => {
    setSelectedRecord(record);
    setEditedStatus(record.status);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedRecord) {
      const updatedRecords = scanningRecords.map(record => 
        record.book_id === selectedRecord.book_id
        ? { ...record, status: editedStatus, updated_at: new Date().toISOString() }
        : record
      );
      setScanningRecords(updatedRecords);
      toast({ title: 'Status Updated', description: `Status for "${selectedRecord.title}" has been updated.` });
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
    }
  };

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold tracking-tight">I.T & Scanning</h1>
            <p className="text-muted-foreground mt-2">Monitor the book scanning and digitization workflow.</p>
       </div>

        <Card>
            <CardHeader>
                <CardTitle>Scanning Progress</CardTitle>
                <CardDescription>
                    A real-time overview of the book digitization pipeline.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden w-[100px] sm:table-cell">
                                Book ID
                            </TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Scanner</TableHead>
                            <TableHead className="hidden md:table-cell">QC By</TableHead>
                            <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {scanningRecords.map((record) => (
                            <TableRow key={record.book_id}>
                                <TableCell className="hidden sm:table-cell font-medium">{record.book_id}</TableCell>
                                <TableCell className="font-medium">{record.title}</TableCell>
                                <TableCell>
                                     <Badge variant={getStatusVariant(record.status)}>
                                        {record.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{record.scanner || 'N/A'}</TableCell>
                                <TableCell className="hidden md:table-cell">{record.qc_by || 'N/A'}</TableCell>
                                <TableCell className="hidden lg:table-cell">{formatDateTime(record.updated_at)}</TableCell>
                                <TableCell>
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
                                            <DropdownMenuItem onClick={() => handleEditClick(record)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Update Status</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Book Status</DialogTitle>
                    <DialogDescription>
                        Update the scanning status for <span className="font-semibold">{selectedRecord?.title}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <Select onValueChange={setEditedStatus} defaultValue={editedStatus}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleUpdateStatus}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
      </Dialog>
    </div>
  );
}
