
// src/app/dashboard/scanning/page.tsx
'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
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
import { MoreHorizontal, Search, X, Upload } from 'lucide-react';
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
import { useAuth } from '@/hooks/use-auth';
import Papa from 'papaparse';


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
  uploaded_by: string | null;
  source: string;
  created_time: string;
  last_edited_time: string;
  last_edited_by: string | null;
  month: string;
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
  const { importScanningRecords } = useAuth();
  const [scanningRecords, setScanningRecords] = useState<ScanningRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedRecords = localStorage.getItem('scanningProgressRecords');
      setScanningRecords(storedRecords ? JSON.parse(storedRecords) : JSON.parse(scanningProgressRecordsJSON));
    } catch (e) {
      setScanningRecords(JSON.parse(scanningProgressRecordsJSON));
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ScanningRecord | null>(null);
  const [editedStatus, setEditedStatus] = useState('');

  const [filters, setFilters] = useState({
    year: '',
    status: '',
    scanned_by: '',
    assigned_to: '',
    uploaded_by: '',
    source: '',
    month: '',
  });

  const filterOptions = useMemo(() => {
    const options = {
      year: new Set<string>(),
      status: new Set<string>(),
      scanned_by: new Set<string>(),
      assigned_to: new Set<string>(),
      uploaded_by: new Set<string>(),
      source: new Set<string>(),
      month: new Set<string>(),
    };
    scanningRecords.forEach(record => {
      if (record.year) options.year.add(record.year);
      if (record.status) options.status.add(record.status);
      if (record.scanned_by) options.scanned_by.add(record.scanned_by);
      if (record.assigned_to) options.assigned_to.add(record.assigned_to);
      if (record.uploaded_by) options.uploaded_by.add(record.uploaded_by);
      if (record.source) options.source.add(record.source);
      if (record.month) options.month.add(record.month);
    });
    return {
      year: Array.from(options.year).sort(),
      status: Array.from(options.status).sort(),
      scanned_by: Array.from(options.scanned_by).sort(),
      assigned_to: Array.from(options.assigned_to).sort(),
      uploaded_by: Array.from(options.uploaded_by).sort(),
      source: Array.from(options.source).sort(),
      month: Array.from(options.month).sort(),
    };
  }, [scanningRecords]);

  const filteredRecords = useMemo(() => {
    return scanningRecords.filter(record => {
      return (
        (record.title_english || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filters.year ? record.year === filters.year : true) &&
        (filters.status ? record.status === filters.status : true) &&
        (filters.scanned_by ? record.scanned_by === filters.scanned_by : true) &&
        (filters.assigned_to ? record.assigned_to === filters.assigned_to : true) &&
        (filters.uploaded_by ? record.uploaded_by === filters.uploaded_by : true) &&
        (filters.source ? record.source === filters.source : true) &&
        (filters.month ? record.month === filters.month : true)
      );
    });
  }, [scanningRecords, searchTerm, filters]);


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
      localStorage.setItem('scanningProgressRecords', JSON.stringify(updatedRecords));
      toast({ title: 'Status Updated', description: `Status for "${selectedRecord.title_english}" has been updated.` });
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
    }
  };
  
  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({...prev, [filterName]: value}));
  };

  const clearFilters = () => {
    setFilters({
      year: '',
      status: '',
      scanned_by: '',
      assigned_to: '',
      uploaded_by: '',
      source: '',
      month: '',
    });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            // @ts-ignore
            importScanningRecords(results.data as ScanningRecord[]);
            // @ts-ignore
            setScanningRecords(results.data as ScanningRecord[]);
            toast({
              title: "Import Successful",
              description: `${results.data.length} records have been imported.`,
            });
          } catch (e: any) {
             toast({
                variant: "destructive",
                title: "Import Failed",
                description: e.message || "An unknown error occurred.",
              });
          }
        },
        error: (error) => {
          toast({
            variant: "destructive",
            title: "Import Failed",
            description: error.message,
          });
        },
      });
    }
  };


  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold tracking-tight">Digitization Progress</h1>
            <p className="text-muted-foreground mt-2">Monitor the book scanning and digitization workflow.</p>
       </div>

        <Card>
            <CardHeader>
                <CardTitle>Import from CSV</CardTitle>
                <CardDescription>Upload a CSV file to populate the digitization progress table.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                </Button>
                <CardDescription className="mt-4">
                  Your CSV file should have the following columns. The order of columns is important.
                </CardDescription>
                <div className="overflow-x-auto mt-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>book_id</TableHead>
                                <TableHead>file_name</TableHead>
                                <TableHead>file_name_sindhi</TableHead>
                                <TableHead>title_english</TableHead>
                                <TableHead>title_sindhi</TableHead>
                                <TableHead>author_english</TableHead>
                                <TableHead>author_sindhi</TableHead>
                                <TableHead>year</TableHead>
                                <TableHead>language</TableHead>
                                <TableHead>link</TableHead>
                                <TableHead>status</TableHead>
                                <TableHead>scanned_by</TableHead>
                                <TableHead>assigned_to</TableHead>
                                <TableHead>uploaded_by</TableHead>
                                <TableHead>source</TableHead>
                                <TableHead>created_time</TableHead>
                                <TableHead>last_edited_time</TableHead>
                                <TableHead>last_edited_by</TableHead>
                                <TableHead>month</TableHead>
                            </TableRow>
                        </TableHeader>
                    </Table>
                </div>
            </CardContent>
        </Card>

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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 pt-4">
                  <Select value={filters.year} onValueChange={(v) => handleFilterChange('year', v)}>
                    <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                    <SelectContent>
                      {filterOptions.year.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      {filterOptions.status.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                   <Select value={filters.scanned_by} onValueChange={(v) => handleFilterChange('scanned_by', v)}>
                    <SelectTrigger><SelectValue placeholder="Scanned By" /></SelectTrigger>
                    <SelectContent>
                      {filterOptions.scanned_by.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.assigned_to} onValueChange={(v) => handleFilterChange('assigned_to', v)}>
                    <SelectTrigger><SelectValue placeholder="Assigned To" /></SelectTrigger>
                    <SelectContent>
                      {filterOptions.assigned_to.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.uploaded_by} onValueChange={(v) => handleFilterChange('uploaded_by', v)}>
                    <SelectTrigger><SelectValue placeholder="Uploaded By" /></SelectTrigger>
                    <SelectContent>
                      {filterOptions.uploaded_by.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.source} onValueChange={(v) => handleFilterChange('source', v)}>
                    <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                    <SelectContent>
                      {filterOptions.source.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.month} onValueChange={(v) => handleFilterChange('month', v)}>
                    <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                    <SelectContent>
                      {filterOptions.month.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                      <X className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
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
                            <TableHead>Status</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Scanned By</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Uploaded By</TableHead>
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
                                <TableCell>
                                     <Badge className={cn(getStatusClasses(record.status))}>
                                        {record.status}
                                    </Badge>
                                </TableCell>
                                <TableCell><a href={record.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Link</a></TableCell>
                                <TableCell>{record.scanned_by || 'N/A'}</TableCell>
                                <TableCell>{record.assigned_to || 'N/A'}</TableCell>
                                <TableCell>{record.uploaded_by || 'N/A'}</TableCell>
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
