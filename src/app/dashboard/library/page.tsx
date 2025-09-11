
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
import { PlusCircle, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type BillEntry = {
  id: number;
  bookTitle: string;
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

  const [newEntry, setNewEntry] = useState({
    bookTitle: '',
    purchaserName: '',
    quantity: '',
    unitPrice: '',
    discountPercent: '0',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEntry = () => {
    const { bookTitle, purchaserName, quantity, unitPrice, discountPercent } = newEntry;

    if (!bookTitle || !purchaserName || !quantity || !unitPrice) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all required fields before adding an entry.',
      });
      return;
    }

    const newBillEntry: BillEntry = {
      id: nextEntryId,
      bookTitle,
      purchaserName,
      date: new Date().toLocaleDateString('en-US'),
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      discountPercent: parseFloat(discountPercent),
    };

    setBillEntries(prev => [...prev, newBillEntry]);
    setNextEntryId(prev => prev + 1);

    // Reset form
    setNewEntry({
      bookTitle: '',
      purchaserName: '',
      quantity: '',
      unitPrice: '',
      discountPercent: '0',
    });

    toast({
      title: 'Entry Added',
      description: `Added "${bookTitle}" to the bill.`,
    });
  };

  const handleDeleteEntry = (id: number) => {
    setBillEntries(prev => prev.filter(entry => entry.id !== id));
    toast({
      title: 'Entry Removed',
      description: 'The selected entry has been removed from the bill.',
    });
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
      head: [['Book Title / Author', 'Qty', 'Unit Price', 'Discount %', 'Total']],
      body: entries.map(entry => {
        const { totalAmount } = calculateRow(entry);
        return [
          entry.bookTitle,
          entry.quantity,
          entry.unitPrice.toFixed(2),
          `${entry.discountPercent}%`,
          totalAmount.toFixed(2),
        ];
      }),
      startY: 30,
      foot: [['', '', '', 'Overall Total (Rs.)', totalAmount.toFixed(2)]],
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
        <h1 className="text-3xl font-bold tracking-tight">Auto-Generate Bill</h1>
        <p className="text-muted-foreground mt-2">Create and manage bills for book sales.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Bill Entry</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="bookTitle">Book Title / Author</Label>
                <Input id="bookTitle" name="bookTitle" value={newEntry.bookTitle} onChange={handleInputChange} placeholder="e.g., History of Sindh / Dr. Nabi Bux" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="purchaserName">Purchaser Name</Label>
                <Input id="purchaserName" name="purchaserName" value={newEntry.purchaserName} onChange={handleInputChange} placeholder="e.g., Ali Khan" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" value={newEntry.quantity} onChange={handleInputChange} placeholder="e.g., 2" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (Rs.)</Label>
                <Input id="unitPrice" name="unitPrice" type="number" value={newEntry.unitPrice} onChange={handleInputChange} placeholder="e.g., 500" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="discountPercent">Discount (%)</Label>
                <Input id="discountPercent" name="discountPercent" type="number" value={newEntry.discountPercent} onChange={handleInputChange} />
            </div>
        </CardContent>
        <CardFooter>
             <Button onClick={handleAddEntry}>
                <PlusCircle className="mr-2" /> Add to Bill
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
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.purchaserName}</TableCell>
                      <TableCell>{entry.quantity}</TableCell>
                      <TableCell>{entry.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>{entry.discountPercent}%</TableCell>
                      <TableCell>{discountedPrice.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">{totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
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
                  <TableCell colSpan={9} className="text-center h-24">
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
    </div>
  );
}
