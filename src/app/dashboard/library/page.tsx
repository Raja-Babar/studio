
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Download, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { parseBillEntry } from './actions';


type BillEntry = {
  id: number;
  bookTitle: string;
  bookTitleSindhi: string;
  language: string;
  date: string;
  purchaserName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
};

type GeneratedBill = {
    id: string;
    purchaserName: string;
    date: string;
    totalAmount: number;
    entries: BillEntry[];
};

export default function AutoGenerateBillPage() {
  const { toast } = useToast();
  const [billEntries, setBillEntries] = useState<BillEntry[]>([]);
  const [generatedBills, setGeneratedBills] = useState<GeneratedBill[]>([]);
  const [nextEntryId, setNextEntryId] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BillEntry | null>(null);
  const [editedEntry, setEditedEntry] = useState({
    bookTitle: '',
    bookTitleSindhi: '',
    language: '',
    purchaserName: '',
    quantity: '',
    unitPrice: '',
    discountPercent: '',
  });

  const handleAddEntry = async () => {
    if (!naturalLanguageInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Input',
        description: 'Please enter the bill details in the text area.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await parseBillEntry(naturalLanguageInput);
      if (result.success && result.data) {
        const { bookTitle, purchaserName, quantity, unitPrice, discount } = result.data;
        const newBillEntry: BillEntry = {
          id: nextEntryId,
          bookTitle: bookTitle,
          bookTitleSindhi: '', // AI doesn't provide this yet
          language: '', // AI doesn't provide this yet
          purchaserName: purchaserName,
          date: new Date().toLocaleDateString('en-US'),
          quantity: quantity,
          unitPrice: unitPrice,
          discountPercent: discount,
        };

        setBillEntries(prev => [...prev, newBillEntry]);
        setNextEntryId(prev => prev + 1);
        setNaturalLanguageInput(''); // Clear input on success
        toast({
          title: 'Entry Added',
          description: `Added "${bookTitle}" to the bill.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Parsing Failed',
          description: result.error || 'Could not understand the input. Please try again.',
        });
      }
    } catch (error) {
       toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An error occurred while processing your request.',
        });
    } finally {
      setIsProcessing(false);
    }
  };


  const handleDeleteEntry = (id: number) => {
    setBillEntries(prev => prev.filter(entry => entry.id !== id));
    toast({
      title: 'Entry Removed',
      description: 'The selected entry has been removed from the bill.',
    });
  };

  const handleEditClick = (entry: BillEntry) => {
    setSelectedEntry(entry);
    setEditedEntry({
      bookTitle: entry.bookTitle,
      bookTitleSindhi: entry.bookTitleSindhi,
      language: entry.language,
      purchaserName: entry.purchaserName,
      quantity: entry.quantity.toString(),
      unitPrice: entry.unitPrice.toString(),
      discountPercent: entry.discountPercent.toString(),
    });
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateEntry = () => {
    if (selectedEntry) {
        setBillEntries(prev => prev.map(entry =>
            entry.id === selectedEntry.id ? {
                ...entry,
                bookTitle: editedEntry.bookTitle,
                bookTitleSindhi: editedEntry.bookTitleSindhi,
                language: editedEntry.language,
                purchaserName: editedEntry.purchaserName,
                quantity: parseFloat(editedEntry.quantity),
                unitPrice: parseFloat(editedEntry.unitPrice),
                discountPercent: parseFloat(editedEntry.discountPercent),
            } : entry
        ));
        setIsEditDialogOpen(false);
        setSelectedEntry(null);
        toast({
            title: 'Entry Updated',
            description: 'The bill entry has been successfully updated.',
        });
    }
  };


  const calculateRow = (entry: BillEntry) => {
    const discountAmount = entry.unitPrice * (entry.discountPercent / 100);
    const discountedPrice = entry.unitPrice - discountAmount;
    const totalAmount = discountedPrice * entry.quantity;
    return { discountedPrice, totalAmount };
  };
  
  const overallTotal = billEntries.reduce((acc, entry) => {
    const { totalAmount } = calculateRow(entry);
    return acc + totalAmount;
  }, 0);

  const generateAndSavePDF = (bill: GeneratedBill) => {
    const doc = new jsPDF();
    const { id, purchaserName, date, totalAmount, entries } = bill;

    doc.text(`Bill for ${purchaserName} (ID: ${id})`, 14, 16);
    doc.text(`Date: ${date}`, 14, 22);

    (doc as any).autoTable({
      head: [['Book Title / Author', 'Book Title / Author (Sindhi)', 'Language', 'Qty', 'Unit Price', 'Discount %', 'Total']],
      body: entries.map(entry => {
        const { totalAmount } = calculateRow(entry);
        return [
          entry.bookTitle,
          entry.bookTitleSindhi,
          entry.language,
          entry.quantity,
          entry.unitPrice.toFixed(2),
          `${entry.discountPercent}%`,
          totalAmount.toFixed(2),
        ];
      }),
      startY: 30,
      foot: [['', '', '', '', '', 'Overall Total (Rs.)', totalAmount.toFixed(2)]],
      footStyles: {
        fillColor: [230, 230, 230],
        textColor: 20,
        fontStyle: 'bold',
      },
    });

    doc.save(`bill_${purchaserName.replace(/\s+/g, '_')}_${id}.pdf`);
  };
  

  const handleExportPDF = () => {
    if (billEntries.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'There are no entries to export.',
      });
      return;
    }

    const billDate = new Date().toLocaleDateString('en-US');
    const purchaserName = billEntries.length > 0 ? billEntries[0].purchaserName : 'Customer';
    const newBill: GeneratedBill = {
        id: `BILL-${Date.now()}`,
        purchaserName,
        date: billDate,
        totalAmount: overallTotal,
        entries: [...billEntries],
    };

    setGeneratedBills(prev => [newBill, ...prev]);
    generateAndSavePDF(newBill);

    // Clear current bill
    setBillEntries([]);
    setNextEntryId(1);
    
    toast({
        title: 'Bill Generated',
        description: `Bill ${newBill.id} has been exported and recorded.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Auto-Generate-Bill</h1>
        <p className="text-muted-foreground mt-2">Create and manage bills for book sales.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Bill Entry</CardTitle>
           <CardDescription>
            Enter the bill details in any language (English, Sindhi, Urdu). For example: "2 copies of 'History of Sindh' for Ali Khan at 500 each with a 10% discount."
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <Label htmlFor="natural-language-input">Bill Details</Label>
                <Textarea
                    id="natural-language-input"
                    placeholder="Enter bill details here..."
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                    rows={4}
                />
            </div>
        </CardContent>
        <CardFooter>
             <Button onClick={handleAddEntry} disabled={isProcessing}>
                <PlusCircle className="mr-2" /> {isProcessing ? 'Processing...' : 'Add to Bill'}
            </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Bill</CardTitle>
              <CardDescription>Review the items added to the current bill.</CardDescription>
            </div>
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Title / Author</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Purchaser Name</TableHead>
                <TableHead>Quantity Sold</TableHead>
                <TableHead>Unit Price (Rs.)</TableHead>
                <TableHead>Discount %</TableHead>
                <TableHead>Discounted Price (Rs.)</TableHead>
                <TableHead>Total Amount (Rs.)</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billEntries.length > 0 ? (
                billEntries.map(entry => {
                  const { discountedPrice, totalAmount } = calculateRow(entry);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.bookTitle}</TableCell>
                      <TableCell>{entry.language}</TableCell>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.purchaserName}</TableCell>
                      <TableCell>{entry.quantity}</TableCell>
                      <TableCell>{entry.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>{entry.discountPercent}%</TableCell>
                      <TableCell>{discountedPrice.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">{totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="icon" onClick={() => handleEditClick(entry)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center h-24">
                    No entries added to the bill yet. Start by adding a new entry above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {billEntries.length > 0 && (
            <CardFooter className="flex justify-end">
                <div className="text-right">
                    <p className="text-lg font-semibold">Overall Total (Rs.):</p>
                    <p className="text-2xl font-bold text-primary">{overallTotal.toFixed(2)}</p>
                </div>
            </CardFooter>
        )}
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Generated Bills History</CardTitle>
            <CardDescription>A record of all previously generated bills.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Bill ID</TableHead>
                        <TableHead>Purchaser Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total Amount (Rs.)</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {generatedBills.length > 0 ? (
                        generatedBills.map(bill => (
                            <TableRow key={bill.id}>
                                <TableCell className="font-medium">{bill.id}</TableCell>
                                <TableCell>{bill.purchaserName}</TableCell>
                                <TableCell>{bill.date}</TableCell>
                                <TableCell className="font-semibold">{bill.totalAmount.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => generateAndSavePDF(bill)}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Re-Download
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No bills have been generated yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Bill Entry</DialogTitle>
                    <DialogDescription>
                        Make changes to the bill entry here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-bookTitle" className="text-right">Title/Author</Label>
                        <Input id="edit-bookTitle" value={editedEntry.bookTitle} onChange={(e) => setEditedEntry(p => ({...p, bookTitle: e.target.value}))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-bookTitleSindhi" className="text-right" dir="rtl">ڪتاب جو عنوان / ليکڪ</Label>
                        <Input id="edit-bookTitleSindhi" value={editedEntry.bookTitleSindhi} onChange={(e) => setEditedEntry(p => ({...p, bookTitleSindhi: e.target.value}))} className="col-span-3 text-right" dir="rtl" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-language" className="text-right">Language</Label>
                        <Input id="edit-language" value={editedEntry.language} onChange={(e) => setEditedEntry(p => ({...p, language: e.target.value}))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-purchaserName" className="text-right">Purchaser</Label>
                        <Input id="edit-purchaserName" value={editedEntry.purchaserName} onChange={(e) => setEditedEntry(p => ({...p, purchaserName: e.target.value}))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-quantity" className="text-right">Quantity</Label>
                        <Input id="edit-quantity" type="number" value={editedEntry.quantity} onChange={(e) => setEditedEntry(p => ({...p, quantity: e.target.value}))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-unitPrice" className="text-right">Unit Price</Label>
                        <Input id="edit-unitPrice" type="number" value={editedEntry.unitPrice} onChange={(e) => setEditedEntry(p => ({...p, unitPrice: e.target.value}))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-discountPercent" className="text-right">Discount %</Label>
                        <Input id="edit-discountPercent" type="number" value={editedEntry.discountPercent} onChange={(e) => setEditedEntry(p => ({...p, discountPercent: e.target.value}))} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleUpdateEntry}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
  