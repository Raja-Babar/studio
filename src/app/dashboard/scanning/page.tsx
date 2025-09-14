
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
import { MoreHorizontal, Search, X, Upload, PlusCircle, CalendarClock, Loader2, Trash2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import Papa from 'papaparse';
import { parseAndTranslate } from './actions';


type ScanningRecord = {
  book_id: string;
  file_name: string;
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
  assigned_date: string | null;
  assigned_time: string | null;
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
  const { user, importScanningRecords, getUsers } = useAuth();
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
  
  const initialNewRecordState = {
    file_name: '',
    title_english: '',
    title_sindhi: '',
    author_english: '',
    author_sindhi: '',
    year: '',
    language: '',
    link: '',
    status: 'Pending',
    scanned_by: null,
    assigned_to: null,
    assigned_date: null,
    assigned_time: null,
    uploaded_by: null,
    source: '',
    created_time: '',
    last_edited_time: '',
    last_edited_by: null,
    month: '',
  };
  const [newRecord, setNewRecord] = useState(initialNewRecordState);
  
  const [editedStatus, setEditedStatus] = useState('');
  const [editedAssignedTo, setEditedAssignedTo] = useState<string | null>(null);

  const [assignTaskBookId, setAssignTaskBookId] = useState('');
  const [assignTaskEmployeeId, setAssignTaskEmployeeId] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const employees = useMemo(() => getUsers().filter(u => u.role === 'I.T & Scanning-Employee'), [getUsers]);


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


  const handleEditClick = (record: ScanningRecord) => {
    setSelectedRecord(record);
    setEditedStatus(record.status);
    setEditedAssignedTo(record.assigned_to);
    setIsEditDialogOpen(true);
  };
  
    const handleDeleteRecord = (book_id: string) => {
    const updatedRecords = scanningRecords.filter(record => record.book_id !== book_id);
    setScanningRecords(updatedRecords);
    localStorage.setItem('scanningProgressRecords', JSON.stringify(updatedRecords));
    toast({
      title: 'Record Deleted',
      description: 'The digitization record has been successfully deleted.',
      variant: 'destructive'
    });
  };

  const handleUpdateRecord = () => {
    if (selectedRecord && user) {
      const updatedRecords = scanningRecords.map(record => 
        record.book_id === selectedRecord.book_id
        ? { 
            ...record, 
            status: editedStatus,
            scanned_by: editedStatus.toLowerCase() === 'scanning' ? user.name : record.scanned_by,
            uploaded_by: editedStatus.toLowerCase() === 'uploading' ? user.name : record.uploaded_by,
            assigned_to: editedAssignedTo,
            assigned_date: record.assigned_to !== editedAssignedTo ? new Date().toLocaleDateString('en-CA') : record.assigned_date,
            assigned_time: record.assigned_to !== editedAssignedTo ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : record.assigned_time,
            last_edited_time: new Date().toISOString(),
            last_edited_by: user.name,
          }
        : record
      );
      setScanningRecords(updatedRecords);
      localStorage.setItem('scanningProgressRecords', JSON.stringify(updatedRecords));
      toast({ title: 'Record Updated', description: `Record for "${selectedRecord.title_english}" has been updated.` });
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
            const now = new Date().toISOString();
            const mappedData = (results.data as any[]).map((row, index) => ({
                ...row,
                book_id: `BK-${Date.now()}-${index}`,
                created_time: now,
                last_edited_time: now,
                last_edited_by: user?.name || null,
                scanned_by: row.scanned_by || null,
                assigned_to: row.assigned_to || null,
                assigned_date: null,
                assigned_time: null,
                uploaded_by: row.uploaded_by || null,
            }));
            
            importScanningRecords(mappedData as ScanningRecord[]);
            setScanningRecords(mappedData as ScanningRecord[]);

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
  
  const handleAddRecord = () => {
    if (!newRecord.title_english) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "English Title is required.",
      });
      return;
    }
    const now = new Date().toISOString();
    const recordToAdd: ScanningRecord = {
      ...newRecord,
      book_id: `BK-${Date.now()}`,
      created_time: now,
      last_edited_time: now,
      last_edited_by: user?.name || null,
      scanned_by: newRecord.status.toLowerCase() === 'scanning' ? user?.name || null : null,
      uploaded_by: newRecord.status.toLowerCase() === 'uploading' ? user?.name || null : null,
    };
    
    const updatedRecords = [recordToAdd, ...scanningRecords];
    setScanningRecords(updatedRecords);
    localStorage.setItem('scanningProgressRecords', JSON.stringify(updatedRecords));
    setNewRecord(initialNewRecordState);
    toast({ title: 'Record Added', description: `Record for "${recordToAdd.title_english}" has been added.` });
  };
  
  const handleNewRecordInputChange = (field: keyof Omit<ScanningRecord, 'book_id'>, value: string) => {
    setNewRecord(prev => ({...prev, [field]: value}));
  }

  const handleAssignTask = () => {
    if (!assignTaskBookId || !assignTaskEmployeeId) {
      toast({ variant: 'destructive', title: 'Assignment Failed', description: 'Please select both a book and an employee.' });
      return;
    }

    const employee = employees.find(e => e.id === assignTaskEmployeeId);
    if (!employee) return;

    const updatedRecords = scanningRecords.map(record => 
      record.book_id === assignTaskBookId
      ? { 
          ...record, 
          assigned_to: employee.name,
          assigned_date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
          assigned_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          last_edited_time: new Date().toISOString(),
          last_edited_by: user?.name || null,
        }
      : record
    );
    setScanningRecords(updatedRecords);
    localStorage.setItem('scanningProgressRecords', JSON.stringify(updatedRecords));
    toast({ title: 'Task Assigned', description: `Task has been assigned to ${employee.name}.` });
    setAssignTaskBookId('');
    setAssignTaskEmployeeId('');
  };

  const handleParseFilename = async () => {
    const filename = newRecord.file_name.replace(/\.[^/.]+$/, ""); // remove extension
    
    const parts = filename.split('-');

    if (parts.length < 2) {
      return;
    }

    const title = parts[0]?.replace(/_/g, ' ').trim() || '';
    const author = parts[1]?.replace(/_/g, ' ').trim() || '';
    const year = parts[2]?.trim() || '';
    
    const isSindhi = (text: string) => /[\u0600-\u06FF]/.test(text);

    let language = 'English';
    if (isSindhi(title) || isSindhi(author)) {
      language = 'Sindhi';
    }

    setNewRecord(prev => ({
        ...prev,
        author_english: author,
        title_english: title,
        year: year,
        language: language,
    }));

    if (title || author) {
        setIsParsing(true);
        try {
            const result = await parseAndTranslate(title, author);
            if (result.success && result.data) {
                setNewRecord(prev => ({
                    ...prev,
                    title_sindhi: result.data.titleSindhi,
                    author_sindhi: result.data.authorSindhi
                }));
            } else {
                toast({ variant: 'destructive', title: 'Translation Failed', description: result.error });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to contact translation service.' });
        } finally {
            setIsParsing(false);
        }
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
                <CardDescription className="mt-2 text-primary">Your CSV file should have the following columns. The order of columns is important.</CardDescription><CardDescription className="mt-2 font-sindhi text-lg text-primary">توهان جي فائل ۾ هيٺيان ڪالمن هجڻ گهرجن، ڪالمن جي ترتيب اهم آهي۔</CardDescription>
                <div className="mt-2 text-sm text-muted-foreground">
                    <ul className="list-disc list-inside space-y-1">
                        <li>file_name</li>
                        <li>title_english</li>
                        <li>title_sindhi</li>
                        <li>author_english</li>
                        <li>author_sindhi</li>
                        <li>year</li>
                        <li>language</li>
                        <li>link</li>
                        <li>status</li>
                        <li>source</li>
                        <li>month</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Add New Record</CardTitle>
            <CardDescription>Manually add a new book record to the digitization progress table.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-lg">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="new-file_name">File Name</Label>
                        <Label htmlFor="new-file_name" className="font-sindhi text-lg">فائل جو نالو</Label>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Input id="new-file_name" value={newRecord.file_name} onChange={(e) => handleNewRecordInputChange('file_name', e.target.value)} onBlur={handleParseFilename} />
                      {isParsing && <Loader2 className="animate-spin" />}
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="new-title_english">Title (English)</Label>
                        <Label htmlFor="new-title_english" className="font-sindhi text-lg">عنوان (انگريزي)</Label>
                    </div>
                    <Input id="new-title_english" value={newRecord.title_english} onChange={(e) => handleNewRecordInputChange('title_english', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="new-title_sindhi">Title (Sindhi)</Label>
                        <Label htmlFor="new-title_sindhi" className="font-sindhi text-lg">عنوان (سنڌي)</Label>
                    </div>
                    <Input id="new-title_sindhi" className="font-sindhi" dir="rtl" value={newRecord.title_sindhi} onChange={(e) => handleNewRecordInputChange('title_sindhi', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="new-author_english">Author (English)</Label>
                        <Label htmlFor="new-author_english" className="font-sindhi text-lg">ليکڪ (انگريزي)</Label>
                    </div>
                    <Input id="new-author_english" value={newRecord.author_english} onChange={(e) => handleNewRecordInputChange('author_english', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="new-author_sindhi">Author (Sindhi)</Label>
                        <Label htmlFor="new-author_sindhi" className="font-sindhi text-lg">ليکڪ (سنڌي)</Label>
                    </div>
                    <Input id="new-author_sindhi" className="font-sindhi" dir="rtl" value={newRecord.author_sindhi} onChange={(e) => handleNewRecordInputChange('author_sindhi', e.target.value)} />
                </div>
                <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <Label htmlFor="new-year">Year</Label>
                        <Label htmlFor="new-year" className="font-sindhi text-lg">سال</Label>
                    </div>
                    <Input id="new-year" value={newRecord.year} onChange={(e) => handleNewRecordInputChange('year', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="new-language">Language</Label>
                        <Label htmlFor="new-language" className="font-sindhi text-lg">ٻولي</Label>
                    </div>
                    <Input id="new-language" value={newRecord.language} onChange={(e) => handleNewRecordInputChange('language', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="new-link">Link</Label>
                        <Label htmlFor="new-link" className="font-sindhi text-lg">لنڪ</Label>
                    </div>
                    <Input id="new-link" value={newRecord.link} onChange={(e) => handleNewRecordInputChange('link', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="new-status">Status</Label>
                        <Label htmlFor="new-status" className="font-sindhi text-lg">اسٽيٽس</Label>
                    </div>
                    <Select value={newRecord.status} onValueChange={(v) => handleNewRecordInputChange('status', v)}>
                        <SelectTrigger id="new-status">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <Label htmlFor="new-source">Source</Label>
                        <Label htmlFor="new-source" className="font-sindhi text-lg">ذريعو</Label>
                    </div>
                    <Input id="new-source" value={newRecord.source} onChange={(e) => handleNewRecordInputChange('source', e.target.value)} />
                </div>
                <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <Label htmlFor="new-month">Month</Label>
                        <Label htmlFor="new-month" className="font-sindhi text-lg">مهينو</Label>
                    </div>
                    <Input id="new-month" value={newRecord.month} onChange={(e) => handleNewRecordInputChange('month', e.target.value)} />
                </div>
            </div>
             <Button onClick={handleAddRecord} className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </CardContent>
        </Card>

        {user?.role === 'Admin' && (
            <Card>
                <CardHeader>
                    <CardTitle>Assign Task</CardTitle>
                    <CardDescription>Assign a book to an employee for processing.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-w-lg">
                        <div className="space-y-2">
                            <Label htmlFor="assign-book">Book</Label>
                            <Select value={assignTaskBookId} onValueChange={setAssignTaskBookId}>
                                <SelectTrigger id="assign-book">
                                    <SelectValue placeholder="Select a book to assign" />
                                </SelectTrigger>
                                <SelectContent>
                                    {scanningRecords.map(rec => (
                                        <SelectItem key={rec.book_id} value={rec.book_id}>{rec.title_english}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="assign-employee">Assign To</Label>
                            <Select value={assignTaskEmployeeId} onValueChange={setAssignTaskEmployeeId}>
                                <SelectTrigger id="assign-employee">
                                    <SelectValue placeholder="Select an employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAssignTask}>
                            <CalendarClock className="mr-2 h-4 w-4" /> Assign Task
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )}


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
                            <TableHead><div>File Name</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">فائل جو نالو</div></TableHead>
                            <TableHead><div>Title (English)</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">عنوان (انگريزي)</div></TableHead>
                            <TableHead><div>Title (Sindhi)</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">عنوان (سنڌي)</div></TableHead>
                            <TableHead><div>Author (English)</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">ليکڪ (انگريزي)</div></TableHead>
                            <TableHead><div>Author (Sindhi)</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">ليکڪ (سنڌي)</div></TableHead>
                            <TableHead><div>Year</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">سال</div></TableHead>
                            <TableHead><div>Language</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">ٻولي</div></TableHead>
                            <TableHead><div>Status</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">اسٽيٽس</div></TableHead>
                            <TableHead><div>Link</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">لنڪ</div></TableHead>
                            <TableHead><div>Scanned By</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">اسڪين ڪندڙ</div></TableHead>
                            <TableHead><div>Assigned To</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">مقرر ٿيل</div></TableHead>
                            <TableHead><div>Assigned At</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">مقرر وقت</div></TableHead>
                            <TableHead><div>Uploaded By</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">اپلوڊ ڪندڙ</div></TableHead>
                            <TableHead><div>Source</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">ذريعو</div></TableHead>
                            <TableHead><div>Month</div><div className="font-sindhi text-sm text-muted-foreground" dir="rtl">مهينو</div></TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRecords.map((record) => (
                            <TableRow key={record.book_id}>
                                <TableCell className="font-medium">{record.file_name}</TableCell>
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
                                <TableCell>
                                  {record.assigned_date ? `${record.assigned_date} ${record.assigned_time}` : 'N/A'}
                                </TableCell>
                                <TableCell>{record.uploaded_by || 'N/A'}</TableCell>
                                <TableCell>{record.source}</TableCell>
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
                                                            Are you sure you want to delete this record? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteRecord(record.book_id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Book Record</DialogTitle>
                    <DialogDescription>
                        Update the record for <span className="font-semibold">{selectedRecord?.title_english}</span>.
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
                     {user?.role === 'Admin' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="assigned_to" className="text-right">
                                Assign To
                            </Label>
                            <Select onValueChange={(value) => setEditedAssignedTo(value === 'null' ? null : value)} defaultValue={editedAssignedTo ?? undefined}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Assign to an employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">Unassign</SelectItem>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
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

    

    





