
// src/app/dashboard/scanning/page.tsx
'use client';

import { useMemo, useState } from 'react';
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
import { MoreHorizontal, Search } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

type ScanningRecord = {
  book_id: string;
  file_name: string;
  file_name_sindhi: string;
  title_english: string;
  title_sindhi: string;
  author_english: string;
  author_sindhi: string;
  year: string;
  language: string;
  link: string;
  status: string;
  scanned_by: string | null;
  assigned_to: string | null;
  source: string;
  created_time: string;
  last_edited_time: string;
  last_edited_by: string | null;
  month: string;
};

const initialScanningRecords: ScanningRecord[] = JSON.parse(scanningProgressRecordsJSON);

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

const statusOptions = [
    "Pending",
    "Scanning",
    "Scanning-QC",
    "Page Cleaning+Cropping",
    "PDF-QC",
    "Uploading",
    "Completed"
];


export default function ScanningPage() {
  const [scanningRecords, setScanningRecords] = useState<ScanningRecord[]>(initialScanningRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ScanningRecord | null>(null);
  const [editedStatus, setEditedStatus] = useState('');
  const { toast } = useToast();

  const filteredRecords = useMemo(() => {
    return scanningRecords.filter(record =>
      record.title_english.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [scanningRecords, searchTerm]);

  const formatDateTime = (isoString: string) => {
    if (!isoString) return 'N/A';
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
        ? { ...record, status: editedStatus, last_edited_time: new Date().toISOString() }
        : record
      );
      setScanningRecords(updatedRecords);
      toast({ title: 'Status Updated', description: `Status for "${selectedRecord.title_english}" has been updated.` });
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
    }
  };

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold tracking-tight">I.T &amp; Scanning</h1>
            <p className="text-muted-foreground mt-2">Monitor the book scanning and digitization workflow.</p>
       </div>

        <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
                <div className="flex-1 w-full">
                    <CardTitle>Digitization Progress</CardTitle>
                    <CardDescription>
                       A real-time overview of the book digitization pipeline.
                    </CardDescription>
                </div>
                 <div className="flex items-center gap-2 w-full md:w-auto flex-col sm:flex-row">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search books..."
                            className="w-full rounded-lg bg-background pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name | فائيل نالو</TableHead>
                            <TableHead>Title (English)</TableHead>
                            <TableHead>Title (Sindhi)</TableHead>
                            <TableHead>Author (English)</TableHead>
                            <TableHead>Author (Sindhi)</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Scanned By</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Created time</TableHead>
                            <TableHead>Last edited time</TableHead>
                            <TableHead>Last edited by</TableHead>
                            <TableHead>Month</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRecords.map((record) => (
                            <TableRow key={record.book_id}>
                                <TableCell className="font-medium">{record.file_name} | {record.file_name_sindhi}</TableCell>
                                <TableCell>{record.title_english}</TableCell>
                                <TableCell>{record.title_sindhi}</TableCell>
                                <TableCell>{record.author_english}</TableCell>
                                <TableCell>{record.author_sindhi}</TableCell>
                                <TableCell>{record.year}</TableCell>
                                <TableCell>{record.language}</TableCell>
                                <TableCell><a href={record.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Link</a></TableCell>
                                <TableCell>
                                     <Badge className={cn(getStatusClasses(record.status))}>
                                        {record.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{record.scanned_by || 'N/A'}</TableCell>
                                <TableCell>{record.assigned_to || 'N/A'}</TableCell>
                                <TableCell>{record.source}</TableCell>
                                <TableCell>{formatDateTime(record.created_time)}</TableCell>
                                <TableCell>{formatDateTime(record.last_edited_time)}</TableCell>
                                <TableCell>{record.last_edited_by || 'N/A'}</TableCell>
                                <TableCell>{record.month}</TableCell>
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
                        Update the scanning status for <span className="font-semibold">{selectedRecord?.title_english}</span>.
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

