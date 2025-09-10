
// src/app/dashboard/scanning/page.tsx
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

type ScanningRecord = {
  book_id: string;
  title: string;
  status: string;
  scanner: string | null;
  qc_by: string | null;
  updated_at: string;
};

const scanningProgressRecords: ScanningRecord[] = JSON.parse(scanningProgressRecordsJSON);

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'default'; // Using default for completed, often green-ish
    case 'uploading':
      return 'secondary';
    case 'scanning':
      return 'outline';
    case 'pdf-qc':
      return 'default';
    case 'scanning-qc':
      return 'destructive'; // Destructive for stages that need attention
    case 'page cleaning+cropping':
       return 'outline';
    default:
      return 'outline';
  }
};


export default function ScanningPage() {
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

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
                        {scanningProgressRecords.map((record) => (
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
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
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

    </div>
  );
}
