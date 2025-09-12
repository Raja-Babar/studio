// src/app/dashboard/petty-cash/page.tsx
'use client';

import { useState, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type Transaction = {
  id: number;
  date: string;
  description: string;
  type: 'debit' | 'credit';
  amount: number;
};

export default function PettyCashPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [nextId, setNextId] = useState(1);

  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'debit' | 'credit'>('debit');

  const handleAddTransaction = () => {
    const amount = parseFloat(newAmount);
    if (!newDescription || isNaN(amount) || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please fill in all fields with valid data.',
      });
      return;
    }

    const newTransaction: Transaction = {
      id: nextId,
      date: newDate,
      description: newDescription,
      type: newType,
      amount: amount,
    };

    setTransactions(prev => [...prev, newTransaction]);
    setNextId(prev => prev + 1);

    // Reset form
    setNewDescription('');
    setNewAmount('');
    toast({
      title: 'Transaction Added',
      description: `A new ${newType} of ${amount} has been recorded.`,
    });
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: 'Transaction Removed',
      description: 'The selected transaction has been removed.',
    });
  };

  const ledger = useMemo(() => {
    let runningBalance = openingBalance;
    const ledgerEntries = transactions.map(t => {
      if (t.type === 'debit') {
        runningBalance -= t.amount;
      } else {
        runningBalance += t.amount;
      }
      return {
        ...t,
        balance: runningBalance,
      };
    });
    return ledgerEntries;
  }, [transactions, openingBalance]);

  const totals = useMemo(() => {
    const totalDebit = transactions
      .filter(t => t.type === 'debit')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalCredit = transactions
      .filter(t => t.type === 'credit')
      .reduce((acc, t) => acc + t.amount, 0);
    const closingBalance = openingBalance - totalDebit + totalCredit;
    return { totalDebit, totalCredit, closingBalance };
  }, [transactions, openingBalance]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const monthYear = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    doc.text(`Petty Cash Ledger - ${monthYear}`, 14, 16);
    doc.text(`Opening Balance: ${openingBalance.toFixed(2)}`, 14, 22);

    (doc as any).autoTable({
      head: [['S.No', 'Date', 'Items/Expenditures', 'Amount Debit', 'Cash Paid/Credit', 'Balance']],
      body: ledger.map((entry, index) => [
        index + 1,
        entry.date,
        entry.description,
        entry.type === 'debit' ? entry.amount.toFixed(2) : '-',
        entry.type === 'credit' ? entry.amount.toFixed(2) : '-',
        entry.balance.toFixed(2),
      ]),
      startY: 30,
      foot: [
        [
          '', '', 'Totals / Closing Balance',
          totals.totalDebit.toFixed(2),
          totals.totalCredit.toFixed(2),
          totals.closingBalance.toFixed(2),
        ],
      ],
      footStyles: {
        fillColor: [230, 230, 230],
        textColor: 20,
        fontStyle: 'bold',
      },
    });

    doc.save(`petty_cash_ledger_${monthYear.replace(' ', '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Petty Cash</h1>
        <p className="text-muted-foreground mt-2">Track and manage petty cash transactions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opening Balance</CardTitle>
          <CardDescription>Set the starting balance for the period.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Label htmlFor="openingBalance">Balance (Rs.)</Label>
            <Input
              id="openingBalance"
              type="number"
              value={openingBalance}
              onChange={e => setOpeningBalance(parseFloat(e.target.value) || 0)}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newDate">Date</Label>
                <Input
                  id="newDate"
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="newDescription">Items/Expenditures</Label>
                <Input
                  id="newDescription"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="e.g., Office Supplies"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newAmount">Amount (Rs.)</Label>
                <Input
                  id="newAmount"
                  type="number"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  placeholder="e.g., 50.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newType">Type</Label>
                <Select value={newType} onValueChange={(value) => setNewType(value as 'debit' | 'credit')}>
                    <SelectTrigger id="newType">
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="debit">Debit (Expense)</SelectItem>
                        <SelectItem value="credit">Credit (Received)</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleAddTransaction}>
              <PlusCircle className="mr-2" /> Add Transaction
            </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Petty Cash Ledger</CardTitle>
            <CardDescription>A record of all transactions for the current period.</CardDescription>
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
                <TableHead>S.No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items/Expenditures</TableHead>
                <TableHead className="text-right">Amount Debit (Rs.)</TableHead>
                <TableHead className="text-right">Cash Paid/Credit (Rs.)</TableHead>
                <TableHead className="text-right">Balance (Rs.)</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.length > 0 ? (
                ledger.map((entry, index) => (
                  <TableRow key={entry.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{new Date(entry.date + 'T00:00:00').toLocaleDateString()}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right text-destructive">
                      {entry.type === 'debit' ? `- ${entry.amount.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-right text-green-500">
                      {entry.type === 'credit' ? `+ ${entry.amount.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{entry.balance.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(entry.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    No transactions recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {transactions.length > 0 && (
            <CardFooter className="flex justify-end pt-4 border-t">
                <div className="w-full max-w-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Debit:</span>
                        <span className="font-semibold text-destructive">{totals.totalDebit.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Credit:</span>
                        <span className="font-semibold text-green-500">{totals.totalCredit.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-lg font-bold">
                        <span>Closing Balance:</span>
                        <span className="text-primary">{totals.closingBalance.toFixed(2)}</span>
                    </div>
                </div>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
