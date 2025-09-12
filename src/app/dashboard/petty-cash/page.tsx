
// src/app/dashboard/petty-cash/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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


type Transaction = {
  id: number;
  date: string;
  description: string;
  debit: number; // Expense
  credit: number; // Received
};

type GeneratedLedger = {
    id: string;
    monthYear: string;
    openingBalance: number;
    closingBalance: number;
    totalDebit: number;
    totalCredit: number;
    transactions: Transaction[];
};

export default function PettyCashPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [nextId, setNextId] = useState(1);

  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDescription, setNewDescription] = useState('');
  const [newDebit, setNewDebit] = useState('');
  const [newCredit, setNewCredit] = useState('');
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editedDate, setEditedDate] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedDebit, setEditedDebit] = useState('');
  const [editedCredit, setEditedCredit] = useState('');

  const [generatedLedgers, setGeneratedLedgers] = useState<GeneratedLedger[]>([]);
  
  const monthYear = new Date(newDate || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  // Load from localStorage on initial render
  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem('pettyCashTransactions');
      const storedOpeningBalance = localStorage.getItem('pettyCashOpeningBalance');
      const storedNextId = localStorage.getItem('pettyCashNextId');
      const storedGeneratedLedgers = localStorage.getItem('pettyCashGeneratedLedgers');

      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      if (storedOpeningBalance) setOpeningBalance(JSON.parse(storedOpeningBalance));
      if (storedNextId) setNextId(JSON.parse(storedNextId));
      if (storedGeneratedLedgers) setGeneratedLedgers(JSON.parse(storedGeneratedLedgers));
    } catch (error) {
      console.error("Failed to load petty cash data from localStorage", error);
      toast({ variant: 'destructive', title: 'Load Error', description: 'Could not load saved petty cash data.' });
    }
  }, [toast]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('pettyCashTransactions', JSON.stringify(transactions));
      localStorage.setItem('pettyCashOpeningBalance', JSON.stringify(openingBalance));
      localStorage.setItem('pettyCashNextId', JSON.stringify(nextId));
      localStorage.setItem('pettyCashGeneratedLedgers', JSON.stringify(generatedLedgers));
    } catch (error) {
      console.error("Failed to save petty cash data to localStorage", error);
    }
  }, [transactions, openingBalance, nextId, generatedLedgers]);


  const handleAddTransaction = () => {
    const debitAmount = parseFloat(newDebit) || 0;
    const creditAmount = parseFloat(newCredit) || 0;

    if (!newDescription || (debitAmount <= 0 && creditAmount <= 0)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please provide a description and a valid debit or credit amount.',
      });
      return;
    }
    
    if (debitAmount > 0 && creditAmount > 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'A transaction can only be a debit or a credit, not both.',
      });
      return;
    }

    const newTransaction: Transaction = {
      id: nextId,
      date: newDate,
      description: newDescription,
      debit: debitAmount,
      credit: creditAmount,
    };

    setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setNextId(prev => prev + 1);

    // Reset form
    setNewDescription('');
    setNewDebit('');
    setNewCredit('');
    
    toast({
      title: 'Transaction Added',
      description: `The transaction for "${newDescription}" has been recorded.`,
    });
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: 'Transaction Removed',
      description: 'The selected transaction has been removed.',
    });
  };

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditedDate(transaction.date);
    setEditedDescription(transaction.description);
    setEditedDebit(transaction.debit > 0 ? String(transaction.debit) : '');
    setEditedCredit(transaction.credit > 0 ? String(transaction.credit) : '');
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateTransaction = () => {
      if (selectedTransaction) {
        const debitAmount = parseFloat(editedDebit) || 0;
        const creditAmount = parseFloat(editedCredit) || 0;

        if (!editedDescription || (debitAmount <= 0 && creditAmount <= 0)) {
          toast({
            variant: 'destructive',
            title: 'Invalid Input',
            description: 'Please provide a description and a valid debit or credit amount.',
          });
          return;
        }

        if (debitAmount > 0 && creditAmount > 0) {
          toast({
            variant: 'destructive',
            title: 'Invalid Input',
            description: 'A transaction can only be a debit or a credit, not both.',
          });
          return;
        }

        setTransactions(prev => prev.map(t =>
            t.id === selectedTransaction.id ? {
                ...t,
                date: editedDate,
                description: editedDescription,
                debit: debitAmount,
                credit: creditAmount,
            } : t
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setIsEditDialogOpen(false);
        setSelectedTransaction(null);
        toast({
            title: 'Transaction Updated',
            description: 'The transaction has been successfully updated.',
        });
    }
  };


  const ledger = useMemo(() => {
    let runningBalance = openingBalance;
    const ledgerEntries = transactions.map(t => {
      runningBalance = runningBalance - t.debit + t.credit;
      return {
        ...t,
        balance: runningBalance,
      };
    });
    return ledgerEntries;
  }, [transactions, openingBalance]);

  const totals = useMemo(() => {
    const totalDebit = transactions.reduce((acc, t) => acc + t.debit, 0);
    const totalCredit = transactions.reduce((acc, t) => acc + t.credit, 0);
    const closingBalance = openingBalance - totalDebit + totalCredit;
    return { totalDebit, totalCredit, closingBalance };
  }, [transactions, openingBalance]);

  const grandTotals = useMemo(() => {
    const grandTotalDebit = generatedLedgers.reduce((acc, ledger) => acc + ledger.totalDebit, 0);
    const grandTotalCredit = generatedLedgers.reduce((acc, ledger) => acc + ledger.totalCredit, 0);
    const netTotal = grandTotalCredit - grandTotalDebit;
    return { grandTotalDebit, grandTotalCredit, netTotal };
  }, [generatedLedgers]);

  const monthlySummary = useMemo(() => {
    const summary: { [month: string]: { totalDebit: number; totalCredit: number; netTotal: number } } = {};
    generatedLedgers.forEach(ledger => {
      const month = ledger.monthYear;
      if (!summary[month]) {
        summary[month] = { totalDebit: 0, totalCredit: 0, netTotal: 0 };
      }
      summary[month].totalDebit += ledger.totalDebit;
      summary[month].totalCredit += ledger.totalCredit;
      summary[month].netTotal += ledger.totalCredit - ledger.totalDebit;
    });
    return Object.entries(summary).map(([month, data]) => ({ month, ...data })).sort((a,b) => new Date(b.month).getTime() - new Date(a.month).getTime());
  }, [generatedLedgers]);

  const monthlySummaryTotals = useMemo(() => {
    return monthlySummary.reduce(
        (acc, summary) => {
            acc.totalDebit += summary.totalDebit;
            acc.totalCredit += summary.totalCredit;
            acc.netTotal += summary.netTotal;
            return acc;
        },
        { totalDebit: 0, totalCredit: 0, netTotal: 0 }
    );
  }, [monthlySummary]);
  
  const generatePdfForLedger = (ledgerData: GeneratedLedger) => {
      const doc = new jsPDF();
      const { monthYear, openingBalance, closingBalance, totalDebit, totalCredit, transactions } = ledgerData;
      
      let runningBalance = openingBalance;
      const ledgerEntriesForPdf = transactions.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => {
        runningBalance = runningBalance - t.debit + t.credit;
        return { ...t, balance: runningBalance };
      });

      doc.text(`Petty Cash Ledger - ${monthYear}`, 14, 16);
      doc.text(`Opening Balance: ${openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 22);

      (doc as any).autoTable({
        head: [['S.No', 'Date', 'Items/Expenditures', 'Amount Debit', 'Amount Credit', 'Balance']],
        body: ledgerEntriesForPdf.map((entry, index) => [
          index + 1,
          new Date(entry.date + 'T00:00:00').toLocaleDateString(),
          entry.description,
          entry.debit > 0 ? entry.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-',
          entry.credit > 0 ? entry.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-',
          entry.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        ]),
        startY: 30,
        foot: [
          [
            '', '', 'Totals / Closing Balance',
            totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          ],
        ],
        footStyles: {
          fillColor: [230, 230, 230],
          textColor: 20,
          fontStyle: 'bold',
        },
      });

      return doc;
  };

  const handleExportPDF = () => {
    if (transactions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Cannot export an empty ledger.',
      });
      return;
    }
    
    const newGeneratedLedger: GeneratedLedger = {
        id: `LGR-${Date.now()}`,
        monthYear: monthYear,
        openingBalance: openingBalance,
        closingBalance: totals.closingBalance,
        totalDebit: totals.totalDebit,
        totalCredit: totals.totalCredit,
        transactions: [...transactions],
    };

    const doc = generatePdfForLedger(newGeneratedLedger);
    doc.save(`petty_cash_ledger_${monthYear.replace(/\s+/g, '_')}.pdf`);

    setGeneratedLedgers(prev => [newGeneratedLedger, ...prev].sort((a,b) => new Date(b.monthYear).getTime() - new Date(a.monthYear).getTime()));
    
    toast({
        title: 'Ledger Exported & Saved',
        description: `The ledger for ${monthYear} has been exported and recorded in history.`,
    });
  };

  const handleDownloadHistoricPDF = (ledgerId: string) => {
    const ledgerToDownload = generatedLedgers.find(l => l.id === ledgerId);
    if (ledgerToDownload) {
        const doc = generatePdfForLedger(ledgerToDownload);
        doc.save(`petty_cash_ledger_${ledgerToDownload.monthYear.replace(/\s+/g, '_')}_${ledgerToDownload.id}.pdf`);
        toast({
            title: 'Historic Ledger Downloaded',
            description: `The ledger for ${ledgerToDownload.monthYear} has been downloaded.`,
        });
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Petty Cash</h1>
        <p className="text-muted-foreground mt-2">Track and manage petty cash transactions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opening Balance for {monthYear}</CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
                <Label htmlFor="newDebit">Amount Debit (Rs.)</Label>
                <Input
                  id="newDebit"
                  type="number"
                  value={newDebit}
                  onChange={e => setNewDebit(e.target.value)}
                  placeholder="Expense amount"
                  disabled={!!newCredit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newCredit">Amount Credit (Rs.)</Label>
                <Input
                  id="newCredit"
                  type="number"
                  value={newCredit}
                  onChange={e => setNewCredit(e.target.value)}
                  placeholder="Received amount"
                  disabled={!!newDebit}
                />
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
            <CardDescription>A record of all transactions for {monthYear}.</CardDescription>
          </div>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF & Save Record
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
                <TableHead className="text-right">Amount Credit (Rs.)</TableHead>
                <TableHead className="text-right">Balance (Rs.)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                      {entry.debit > 0 ? `- ${entry.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                    </TableCell>
                    <TableCell className="text-right text-green-500">
                      {entry.credit > 0 ? `+ ${entry.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{entry.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleEditClick(entry)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                       </Button>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete</span>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Are you sure you want to delete this transaction? This action cannot be undone.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteTransaction(entry.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    No transactions recorded yet for this period.
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
                        <span className="font-semibold text-destructive">{totals.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Credit:</span>
                        <span className="font-semibold text-green-500">{totals.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                     <div className="flex justify-between text-lg font-bold">
                        <span>Closing Balance:</span>
                        <span className="text-primary">{totals.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </CardFooter>
        )}
      </Card>
      
        <Card>
          <CardHeader>
              <CardTitle>Generated Ledgers History</CardTitle>
              <CardDescription>A record of all previously generated and saved ledgers.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Ledger Period</TableHead>
                          <TableHead>Opening Balance</TableHead>
                          <TableHead>Closing Balance</TableHead>
                          <TableHead>Date Saved</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {generatedLedgers.length > 0 ? (
                          generatedLedgers.map(ledger => (
                              <TableRow key={ledger.id}>
                                  <TableCell className="font-medium">{ledger.monthYear}</TableCell>
                                  <TableCell>{ledger.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                  <TableCell className="font-semibold">{ledger.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                  <TableCell>{new Date(parseInt(ledger.id.split('-')[1])).toLocaleDateString()}</TableCell>
                                  <TableCell className="text-right">
                                      <Button variant="ghost" size="sm" onClick={() => handleDownloadHistoricPDF(ledger.id)}>
                                          <Download className="mr-2 h-4 w-4" />
                                          Download PDF
                                      </Button>
                                  </TableCell>
                              </TableRow>
                          ))
                      ) : (
                          <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                  No ledgers have been generated and saved yet.
                              </TableCell>
                          </TableRow>
                      )}
                  </TableBody>
              </Table>
          </CardContent>
             {generatedLedgers.length > 0 && (
                <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold">Grand Totals</h3>
                    <div className="w-full max-w-sm space-y-2">
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Debit (All Records):</span>
                            <span className="font-semibold text-destructive">{grandTotals.grandTotalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Credit (All Records):</span>
                            <span className="font-semibold text-green-500">{grandTotals.grandTotalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                         <div className="flex justify-between text-lg font-bold">
                            <span>Net Total (All Records):</span>
                            <span className={grandTotals.netTotal >= 0 ? 'text-green-500' : 'text-destructive'}>
                                {grandTotals.netTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </CardFooter>
            )}
        </Card>
        
        {monthlySummary.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Summary</CardTitle>
                    <CardDescription>A month-by-month summary of all recorded ledgers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead className="text-right">Total Debit (Rs.)</TableHead>
                                <TableHead className="text-right">Total Credit (Rs.)</TableHead>
                                <TableHead className="text-right">Net Total (Rs.)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {monthlySummary.map(summary => (
                                <TableRow key={summary.month}>
                                    <TableCell className="font-medium">{summary.month}</TableCell>
                                    <TableCell className="text-right text-destructive">
                                        {summary.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right text-green-500">
                                        {summary.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className={`text-right font-semibold ${summary.netTotal >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                                        {summary.netTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="font-bold border-t-2">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right text-destructive">
                                    {monthlySummaryTotals.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-right text-green-500">
                                    {monthlySummaryTotals.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className={`text-right ${monthlySummaryTotals.netTotal >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                                    {monthlySummaryTotals.netTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                    <DialogDescription>
                        Make changes to the transaction here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-date" className="text-right">Date</Label>
                        <Input id="edit-date" type="date" value={editedDate} onChange={(e) => setEditedDate(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-description" className="text-right">Description</Label>
                        <Input id="edit-description" value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-debit" className="text-right">Debit</Label>
                        <Input id="edit-debit" type="number" value={editedDebit} onChange={(e) => setEditedDebit(e.target.value)} className="col-span-3" disabled={!!editedCredit} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-credit" className="text-right">Credit</Label>
                        <Input id="edit-credit" type="number" value={editedCredit} onChange={(e) => setEditedCredit(e.target.value)} className="col-span-3" disabled={!!editedDebit} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleUpdateTransaction}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
