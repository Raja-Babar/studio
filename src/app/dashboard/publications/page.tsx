
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
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Dummy data for generated bills - replace with your actual data source
type BillEntry = {
  id: number;
  bookTitle: string;
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

const dummyBills: GeneratedBill[] = [
    { id: 'BILL-16278401', purchaserName: 'Ali Khan', date: '2024-07-30', totalAmount: 450.00, entries: [{ id: 1, bookTitle: 'History of Sindh', quantity: 1, unitPrice: 500, discountPercent: 10 }] },
    { id: 'BILL-16278402', purchaserName: 'Fatima Ahmed', date: '2024-07-29', totalAmount: 1200.00, entries: [{ id: 1, bookTitle: 'Sindh Through Centuries', quantity: 2, unitPrice: 600, discountPercent: 0 }] },
];
// End of dummy data


export default function PublicationsPage() {
  const [generatedBills, setGeneratedBills] = useState<GeneratedBill[]>(dummyBills);

  const generateAndSavePDF = (bill: GeneratedBill) => {
    const doc = new jsPDF();
    const { id, purchaserName, date, totalAmount, entries } = bill;
    
    doc.text(`Bill for ${purchaserName} (ID: ${id})`, 14, 16);
    doc.text(`Date: ${date}`, 14, 22);

    (doc as any).autoTable({
      head: [['Book Title', 'Qty', 'Unit Price', 'Discount %', 'Total']],
      body: entries.map(entry => {
        const discountAmount = entry.unitPrice * (entry.discountPercent / 100);
        const discountedPrice = entry.unitPrice - discountAmount;
        const totalAmount = discountedPrice * entry.quantity;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bills-Records</h1>
        <p className="text-muted-foreground mt-2">Manage and view generated bills.</p>
      </div>

       <Card>
          <CardHeader>
              <CardTitle>Bills-Record</CardTitle>
              <CardDescription>A record of all previously generated bills.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Bill ID</TableHead>
                          <TableHead>Purchaser Name</TableHead>
                          <TableHead>Books Quantity</TableHead>
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
                                  <TableCell>
                                    {bill.entries.reduce((total, entry) => total + entry.quantity, 0)}
                                  </TableCell>
                                  <TableCell>{bill.date}</TableCell>
                                  <TableCell className="font-semibold">{bill.totalAmount.toFixed(2)}</TableCell>
                                  <TableCell className="text-right">
                                      <Button variant="ghost" size="sm" onClick={() => generateAndSavePDF(bill)}>
                                          <Download className="mr-2 h-4 w-4" />
                                          Download PDF
                                      </Button>
                                  </TableCell>
                              </TableRow>
                          ))
                      ) : (
                          <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
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
