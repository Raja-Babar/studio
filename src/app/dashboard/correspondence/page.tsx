
'use client';

import { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Printer, FileDown, Trash2, PlusCircle, Edit } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TableRowData = {
    id: number;
    sno: string;
    items: string;
    quantity: string;
};

type GeneratedLetter = {
    id: string;
    recipientName: string;
    subject: string;
    date: string;
    letterHeading: string;
    letterHeadingSindhi: string;
    recipientNameSindhi: string;
    recipientDesignation: string;
    recipientDesignationSindhi: string;
    departmentAddress: string;
    departmentAddressSindhi: string;
    subjectSindhi: string;
    body: string;
    bodySindhi: string;
    closing: string;
    closingSindhi: string;
    senderName: string;
    senderNameSindhi: string;
    senderDesignation: string;
    senderDesignationSindhi: string;
    bodyType: 'text' | 'table';
    tableRows: TableRowData[];
};


export default function CorrespondencePage() {
    const { toast } = useToast();
    const [letterHeading, setLetterHeading] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientDesignation, setRecipientDesignation] = useState('');
    const [departmentAddress, setDepartmentAddress] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [closing, setClosing] = useState('');
    const [senderName, setSenderName] = useState('');
    const [senderDesignation, setSenderDesignation] = useState('');

    const [letterHeadingSindhi, setLetterHeadingSindhi] = useState('');
    const [recipientNameSindhi, setRecipientNameSindhi] = useState('');
    const [recipientDesignationSindhi, setRecipientDesignationSindhi] = useState('');
    const [departmentAddressSindhi, setDepartmentAddressSindhi] = useState('');
    const [subjectSindhi, setSubjectSindhi] = useState('');
    const [bodySindhi, setBodySindhi] = useState('');
    const [closingSindhi, setClosingSindhi] = useState('');
    const [senderNameSindhi, setSenderNameSindhi] = useState('');
    const [senderDesignationSindhi, setSenderDesignationSindhi] = useState('');
    
    const [generatedLetters, setGeneratedLetters] = useState<GeneratedLetter[]>([]);
    
    const [bodyType, setBodyType] = useState<'text' | 'table'>('text');
    const [tableRows, setTableRows] = useState<TableRowData[]>([]);
    const [nextTableRowId, setNextTableRowId] = useState(1);
    const [newItems, setNewItems] = useState('');
    const [newQuantity, setNewQuantity] = useState('');


    const todayDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const letterPreviewRef = useRef<HTMLDivElement>(null);
    
     const generateTableHTML = (rows: TableRowData[]) => {
        if (rows.length === 0) return '';
        const headers = `
            <thead style="background-color: #f2f2f2;">
                <tr>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">S.No</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Items</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Quantity</th>
                </tr>
            </thead>
        `;
        const body = rows.map(row => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${row.sno}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${row.items}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${row.quantity}</td>
            </tr>
        `).join('');

        return `<table style="width: 100%; border-collapse: collapse; margin-top: 1rem; margin-bottom: 1.5rem;">${headers}<tbody>${body}</tbody></table>`;
    };
    
    const generatePDF = (letterData: GeneratedLetter | null = null, silent = false) => {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4',
        });
        
        const data = letterData || {
            letterHeading, letterHeadingSindhi, recipientName, recipientNameSindhi,
            recipientDesignation, recipientDesignationSindhi, departmentAddress, departmentAddressSindhi,
            subject, subjectSindhi, body, bodySindhi, closing, closingSindhi,
            senderName, senderNameSindhi, senderDesignation, senderDesignationSindhi,
            date: todayDate,
            id: `LETTER-${Date.now()}`,
            bodyType,
            tableRows,
        };

        const bodyContent = data.bodyType === 'table' 
            ? generateTableHTML(data.tableRows)
            : `<div style="margin-bottom: 1.5rem; white-space: pre-wrap;">
                <p>${data.body}</p>
                <p style="font-family: 'MB Lateefi', sans-serif; font-size: 1.125rem; margin-top: 0.5rem; text-align: right;" dir="rtl">${data.bodySindhi}</p>
            </div>`;


        const tempDiv = document.createElement('div');
        tempDiv.style.width = '595pt'; // A4 width
        tempDiv.style.padding = '40pt';
        tempDiv.style.fontFamily = 'serif';
        tempDiv.innerHTML = `
            <div style="text-align: center; font-weight: bold; font-size: 1.25rem; margin-bottom: 1.5rem;">
                <p>${data.letterHeading}</p>
                <p style="font-family: 'MB Lateefi', sans-serif; font-size: 1.5rem;">${data.letterHeadingSindhi}</p>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                <span>No: MHPRI/</span>
                <span>Date: ${data.date}</span>
            </div>
            <div style="margin-bottom: 1rem;">
                <p>${data.recipientName}</p>
                <p style="font-family: 'MB Lateefi', sans-serif; font-size: 1.125rem;">${data.recipientNameSindhi}</p>
                <p>${data.recipientDesignation}</p>
                <p style="font-family: 'MB Lateefi', sans-serif; font-size: 1.125rem;">${data.recipientDesignationSindhi}</p>
                <p>${data.departmentAddress}</p>
                <p style="font-family: 'MB Lateefi', sans-serif; font-size: 1.125rem;">${data.departmentAddressSindhi}</p>
            </div>
            <div style="margin-bottom: 1rem;">
                <p style="font-weight: bold; text-decoration: underline;">Subject: ${data.subject}</p>
                <p style="font-family: 'MB Lateefi', sans-serif; font-size: 1.125rem; font-weight: bold; text-decoration: underline; text-align: right;" dir="rtl">مضمون: ${data.subjectSindhi}</p>
            </div>
            ${bodyContent}
            <div style="margin-top: 2rem;">
                <p>${data.closing}</p>
                <p style="font-family: 'MB Lateefi', sans-serif; font-size: 1.125rem;">${data.closingSindhi}</p>
                <p style="margin-top: 1rem;">${data.senderName}</p>
                <p style="font-family: 'MB Lateefi', sans-serif; font-size: 1.125rem;">${data.senderNameSindhi}</p>
                <p>${data.senderDesignation}</p>
                <p style="font-family: 'MB Lateefi', sans-serif; font-size: 1.125rem;">${data.senderDesignationSindhi}</p>
            </div>
        `;
        document.body.appendChild(tempDiv);
        
        doc.html(tempDiv, {
            callback: function (doc) {
                if (!silent) {
                    doc.save(`Official_Letter_${(data.recipientName || 'Generated').replace(/\s+/g, '_')}.pdf`);
                }
                
                if (!letterData) { // Only add to history if it's a new letter
                    setGeneratedLetters(prev => [data, ...prev]);
                    toast({
                        title: 'Letter Saved & Exported',
                        description: 'The letter has been saved to history and exported as a PDF.',
                    });
                } else if (!silent) {
                    toast({
                        title: 'PDF Exported',
                        description: 'The historical letter has been exported as a PDF.',
                    });
                }
                 document.body.removeChild(tempDiv);
            },
            x: 0,
            y: 0,
            width: 595,
            windowWidth: tempDiv.scrollWidth,
            html2canvas: {
                scale: 0.75
            }
        });
    };

    const handleDeleteLetter = (id: string) => {
        setGeneratedLetters(prev => prev.filter(letter => letter.id !== id));
        toast({
            title: 'Letter Deleted',
            description: 'The letter has been removed from the history.',
        });
    };

    const printLetter = () => {
        const printContent = letterPreviewRef.current?.innerHTML;
        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Letter</title>');
            printWindow.document.write('<style> body { font-family: sans-serif; } .sindhi { font-family: "MB Lateefi", sans-serif; direction: rtl; text-align: right; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid black; padding: 8px; text-align: left; } </style>');
            printWindow.document.write('</head><body >');
            printWindow.document.write(printContent || '');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };
    
    const handleAddTableRow = () => {
        if (!newItems || !newQuantity) {
            toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill all fields for the table row.' });
            return;
        }
        const newSno = (tableRows.length + 1).toString();
        setTableRows(prev => [...prev, { id: nextTableRowId, sno: newSno, items: newItems, quantity: newQuantity }]);
        setNextTableRowId(prev => prev + 1);
        setNewItems('');
        setNewQuantity('');
    };

    const handleDeleteTableRow = (id: number) => {
        setTableRows(prev => prev.filter(row => row.id !== id));
    };


  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Correspondence with Government Officials</h1>
            <p className="text-muted-foreground mt-2">Create and manage official correspondence.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
            {/* Form Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Compose Letter</CardTitle>
                    <CardDescription>Fill in the details to generate an official letter.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="letterHeading">Letter Heading / Title</Label>
                            <Input id="letterHeading" value={letterHeading} onChange={e => setLetterHeading(e.target.value)} placeholder="e.g., OFFICIAL COMMUNIQUE" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="letterHeadingSindhi" className="font-sindhi text-lg float-right">خط جي عنوان</Label>
                            <Input id="letterHeadingSindhi" value={letterHeadingSindhi} onChange={e => setLetterHeadingSindhi(e.target.value)} placeholder="مثال طور، سرڪاري پڌرائي" className="font-sindhi" dir="rtl" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="recipientName">Recipient Name</Label>
                            <Input id="recipientName" value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="e.g., Dr. John Doe" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="recipientNameSindhi" className="font-sindhi text-lg float-right">وصول ڪندڙ جو نالو</Label>
                            <Input id="recipientNameSindhi" value={recipientNameSindhi} onChange={e => setRecipientNameSindhi(e.target.value)} placeholder="مثال طور، ڊاڪٽر جان ڊو" className="font-sindhi" dir="rtl" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="recipientDesignation">Recipient's Designation</Label>
                            <Input id="recipientDesignation" value={recipientDesignation} onChange={e => setRecipientDesignation(e.target.value)} placeholder="e.g., Director General" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="recipientDesignationSindhi" className="font-sindhi text-lg float-right">عھدو</Label>
                            <Input id="recipientDesignationSindhi" value={recipientDesignationSindhi} onChange={e => setRecipientDesignationSindhi(e.target.value)} placeholder="مثال طور، ڊائريڪٽر جنرل" className="font-sindhi" dir="rtl" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="departmentAddress">Department / Office Address</Label>
                            <Textarea id="departmentAddress" value={departmentAddress} onChange={e => setDepartmentAddress(e.target.value)} placeholder="e.g., Department of Archives, Karachi" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="departmentAddressSindhi" className="font-sindhi text-lg float-right">کاتو / آفيس جو پتو</Label>
                            <Textarea id="departmentAddressSindhi" value={departmentAddressSindhi} onChange={e => setDepartmentAddressSindhi(e.target.value)} placeholder="مثال طور، آرڪائيو کاتو، ڪراچي" className="font-sindhi" dir="rtl" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject Line</Label>
                            <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Request for Archival Access" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="subjectSindhi" className="font-sindhi text-lg float-right">مضمون</Label>
                            <Input id="subjectSindhi" value={subjectSindhi} onChange={e => setSubjectSindhi(e.target.value)} placeholder="آرڪائيو رسائي جي درخواست" className="font-sindhi" dir="rtl" />
                        </div>
                    </div>
                    
                    <Tabs value={bodyType} onValueChange={(value) => setBodyType(value as 'text' | 'table')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Text Body</TabsTrigger>
                            <TabsTrigger value="table">Table Body</TabsTrigger>
                        </TabsList>
                        <TabsContent value="text">
                             <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="body">Body Text</Label>
                                    <Textarea id="body" value={body} onChange={e => setBody(e.target.value)} placeholder="Dear Sir/Madam..." rows={8} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="bodySindhi" className="font-sindhi text-lg float-right">خط جو متن</Label>
                                    <Textarea id="bodySindhi" value={bodySindhi} onChange={e => setBodySindhi(e.target.value)} placeholder="جناب/محترمه..." rows={8} className="font-sindhi" dir="rtl" />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="table">
                            <div className="space-y-4 pt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Table Content</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                         <div className="grid grid-cols-2 gap-2">
                                            <Input placeholder="Items" value={newItems} onChange={e => setNewItems(e.target.value)} />
                                            <Input placeholder="Quantity" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} />
                                        </div>
                                        <Button size="sm" className="mt-2" onClick={handleAddTableRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
                                    </CardContent>
                                </Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>S.No</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tableRows.map(row => (
                                            <TableRow key={row.id}>
                                                <TableCell>{row.sno}</TableCell>
                                                <TableCell>{row.items}</TableCell>
                                                <TableCell>{row.quantity}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTableRow(row.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {tableRows.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center">No items added to the table.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="closing">Closing/Regards</Label>
                            <Input id="closing" value={closing} onChange={e => setClosing(e.target.value)} placeholder="Sincerely" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="closingSindhi" className="font-sindhi text-lg float-right">نيڪ تمنائون</Label>
                            <Input id="closingSindhi" value={closingSindhi} onChange={e => setClosingSindhi(e.target.value)} placeholder="مخلص" className="font-sindhi" dir="rtl" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="senderName">Sender Name</Label>
                            <Input id="senderName" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="e.g., M.H. Panhwar" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="senderNameSindhi" className="font-sindhi text-lg float-right">موڪليندڙ جو نالو</Label>
                            <Input id="senderNameSindhi" value={senderNameSindhi} onChange={e => setSenderNameSindhi(e.target.value)} placeholder="مثال طور، ايم ايڇ پنهور" className="font-sindhi" dir="rtl" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="senderDesignation">Sender's Designation</Label>
                            <Input id="senderDesignation" value={senderDesignation} onChange={e => setSenderDesignation(e.target.value)} placeholder="e.g., Chairman" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="senderDesignationSindhi" className="font-sindhi text-lg float-right">موڪليندڙ جو عھدو</Label>
                            <Input id="senderDesignationSindhi" value={senderDesignationSindhi} onChange={e => setSenderDesignationSindhi(e.target.value)} placeholder="مثال طور، چيئرمين" className="font-sindhi" dir="rtl" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preview Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Letter Preview</CardTitle>
                        <CardDescription>This is how your letter will look.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={printLetter}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                        <Button size="sm" onClick={() => generatePDF()}><FileDown className="mr-2 h-4 w-4" /> Export & Save</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div ref={letterPreviewRef} className="bg-white text-black p-8 rounded-md shadow-lg font-serif">
                        <div className="text-center font-bold text-xl mb-6">
                            <p>{letterHeading}</p>
                            <p className="font-sindhi text-2xl">{letterHeadingSindhi}</p>
                        </div>
                        <div className="flex justify-between mb-6">
                            <span>No: MHPRI/</span>
                            <span>Date: {todayDate}</span>
                        </div>
                        <div className="mb-4">
                            <p>{recipientName}</p>
                            <p className="font-sindhi text-lg">{recipientNameSindhi}</p>
                            <p>{recipientDesignation}</p>
                            <p className="font-sindhi text-lg">{recipientDesignationSindhi}</p>
                            <p>{departmentAddress}</p>
                            <p className="font-sindhi text-lg">{departmentAddressSindhi}</p>
                        </div>
                        <div className="mb-4">
                            <p className="font-bold underline">Subject: {subject}</p>
                            <p className="font-sindhi text-lg font-bold underline" dir="rtl">مضمون: {subjectSindhi}</p>
                        </div>
                        
                        {bodyType === 'text' ? (
                            <div className="mb-6 whitespace-pre-wrap">
                                <p>{body}</p>
                                <p className="font-sindhi text-lg mt-2" dir="rtl">{bodySindhi}</p>
                            </div>
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: generateTableHTML(tableRows) }} />
                        )}

                        <div className="mt-8">
                            <p>{closing}</p>
                            <p className="font-sindhi text-lg">{closingSindhi}</p>
                            <p className="mt-4">{senderName}</p>
                            <p className="font-sindhi text-lg">{senderNameSindhi}</p>
                            <p>{senderDesignation}</p>
                            <p className="font-sindhi text-lg">{senderDesignationSindhi}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Generated Letters History</CardTitle>
                <CardDescription>A record of all previously generated and saved letters.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Recipient</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {generatedLetters.length > 0 ? (
                            generatedLetters.map((letter) => (
                                <TableRow key={letter.id}>
                                    <TableCell>{letter.date}</TableCell>
                                    <TableCell className="font-medium">{letter.recipientName}</TableCell>
                                    <TableCell>{letter.subject}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => generatePDF(letter)}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteLetter(letter.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No letters have been generated yet.
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
