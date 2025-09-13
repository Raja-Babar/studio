
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendWhatsAppInvitations } from './actions';

type Contact = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

type ProgramDetails = {
  programTopic: string;
  programDate: string;
  programTime: string;
  address: string;
  organizer: string;
  phone: string;
  email: string;
  programTopicSindhi: string;
  programDateSindhi: string;
  programTimeSindhi: string;
  addressSindhi: string;
  organizerSindhi: string;
  phoneSindhi: string;
  emailSindhi: string;
}

type ProgramRecord = ProgramDetails & {
  id: number;
};


export default function AutoInvitationPage() {
  const { appLogo } = useAuth();
  const { toast } = useToast();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [nextContactId, setNextContactId] = useState(1);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [adminWhatsapp, setAdminWhatsapp] = useState('');
  const [whatsappApiKey, setWhatsappApiKey] = useState('');
  
  const [programDetails, setProgramDetails] = useState<ProgramDetails>({
    programTopic: '',
    programDate: '',
    programTime: '',
    address: '',
    organizer: '',
    phone: '',
    email: '',
    programTopicSindhi: '',
    programDateSindhi: '',
    programTimeSindhi: '',
    addressSindhi: '',
    organizerSindhi: '',
    phoneSindhi: '',
    emailSindhi: '',
  });
  
  const [submittedPrograms, setSubmittedPrograms] = useState<ProgramRecord[]>([]);
  const [nextProgramId, setNextProgramId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ProgramDetails, value: string) => {
    setProgramDetails(prev => ({...prev, [field]: value}));
  };


  const handleAddContact = () => {
    if (!newContactName || !newContactEmail || !newContactPhone) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in the name, email, and phone number.',
      });
      return;
    }
    const newContact: Contact = {
      id: nextContactId,
      name: newContactName,
      email: newContactEmail,
      phone: newContactPhone,
    };
    setContacts(prev => [...prev, newContact]);
    setNextContactId(prev => prev + 1);
    setNewContactName('');
    setNewContactEmail('');
    setNewContactPhone('');
    toast({
      title: 'Contact Added',
      description: `${newContactName} has been added to the list.`,
    });
  };

  const handleDeleteContact = (id: number) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
    toast({
      title: 'Contact Removed',
      description: 'The contact has been removed from the list.',
    });
  };
  
  const handleSaveWhatsapp = () => {
    toast({
      title: 'WhatsApp Settings Saved',
      description: `WhatsApp settings have been updated.`
    });
  }
  
  const handleSubmitProgram = async () => {
    if (!programDetails.programTopic || !programDetails.programDate || !programDetails.programTime) {
      toast({
        variant: 'destructive',
        title: 'Missing Program Info',
        description: 'Please fill in the program topic, date, and time.',
      });
      return;
    }

    if(contacts.length === 0) {
       toast({
        variant: 'destructive',
        title: 'No Contacts',
        description: 'Please add at least one contact to send invitations to.',
      });
      return;
    }
    
    setIsSubmitting(true);

    const newProgram: ProgramRecord = {
      id: nextProgramId,
      ...programDetails
    };
    setSubmittedPrograms(prev => [newProgram, ...prev]);
    setNextProgramId(prev => prev + 1);

    
    try {
        const result = await sendWhatsAppInvitations({
            programDetails,
            contacts,
            whatsappConfig: {
                apiKey: whatsappApiKey,
                adminPhoneNumber: adminWhatsapp
            }
        });

        if (result.success) {
            toast({
                title: 'Program Submitted & Invitations Sent',
                description: `Invitations for "${programDetails.programTopic}" have been sent.`,
            });
        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Failed to Send Invitations',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    } finally {
        setIsSubmitting(false);
    }


    // Reset form fields
    setProgramDetails({
        programTopic: '', programDate: '', programTime: '', address: '', organizer: '', phone: '', email: '',
        programTopicSindhi: '', programDateSindhi: '', programTimeSindhi: '', addressSindhi: '', organizerSindhi: '', phoneSindhi: '', emailSindhi: ''
    });

  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
              <Image src={appLogo} alt="MHPISSJ-Portal Logo" width={112} height={112} className="h-28 w-28 rounded-full" />
          </div>
          <h1 className="font-bold text-2xl">M.H. Panhwar Institute of Sindh Studies, Jamshoro</h1>
          <CardTitle className="font-sindhi text-3xl">ايم. ايڇ. پنھور انسٽيٽيوٽ آف سنڌ اسٽڊيز، ڄامشورو</CardTitle>
          <p className="text-lg text-muted-foreground">Information about the Program to be held in the Institute</p>
          <CardDescription className="font-sindhi text-xl">اداري ۾ ٿيندڙ پروگرام بابت ڄاڻ</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4 max-w-2xl mx-auto">
            <div className="space-y-2">
              <Label htmlFor="topic-en">Program Topic</Label>
              <Input id="topic-en" type="text" value={programDetails.programTopic} onChange={(e) => handleInputChange('programTopic', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-sd" className="font-sindhi text-lg text-right w-full block">پروگرام جو موضوع</Label>
              <Input id="topic-sd" type="text" className="font-sindhi text-lg" dir="rtl" value={programDetails.programTopicSindhi} onChange={(e) => handleInputChange('programTopicSindhi', e.target.value)}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="date-en">Program Date</Label>
                <Input id="date-en" type="date" value={programDetails.programDate} onChange={(e) => handleInputChange('programDate', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="date-sd" className="font-sindhi text-lg text-right w-full block">پروگرام جي تاريخ</Label>
                <Input id="date-sd" type="date" className="font-sindhi" value={programDetails.programDateSindhi} onChange={(e) => handleInputChange('programDateSindhi', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-en">Program Time</Label>
              <Input id="time-en" type="time" value={programDetails.programTime} onChange={(e) => handleInputChange('programTime', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="time-sd" className="font-sindhi text-lg text-right w-full block">ٿيندڙ پروگرام جو وقت</Label>
                <Input id="time-sd" type="time" className="font-sindhi text-lg" value={programDetails.programTimeSindhi} onChange={(e) => handleInputChange('programTimeSindhi', e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-en">Address</Label>
              <Textarea id="address-en" value={programDetails.address} onChange={(e) => handleInputChange('address', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-sd" className="font-sindhi text-lg text-right w-full block">پتو</Label>
              <Textarea id="address-sd" className="font-sindhi text-lg" dir="rtl" value={programDetails.addressSindhi} onChange={(e) => handleInputChange('addressSindhi', e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizer-en">Organizer</Label>
              <Input id="organizer-en" type="text" value={programDetails.organizer} onChange={(e) => handleInputChange('organizer', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="organizer-sd" className="font-sindhi text-lg text-right w-full block">پروگرام ڪندڙ</Label>
                <Input id="organizer-sd" type="text" className="font-sindhi text-lg" dir="rtl" value={programDetails.organizerSindhi} onChange={(e) => handleInputChange('organizerSindhi', e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-en">Phone No</Label>
              <Input id="phone-en" type="tel" value={programDetails.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone-sd" className="font-sindhi text-lg text-right w-full block">فون نمبر</Label>
                <Input id="phone-sd" type="tel" className="font-sindhi text-lg" dir="rtl" value={programDetails.phoneSindhi} onChange={(e) => handleInputChange('phoneSindhi', e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-en">Email</Label>
              <Input id="email-en" type="email" value={programDetails.email} onChange={(e) => handleInputChange('email', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email-sd" className="font-sindhi text-lg text-right w-full block">اي ميل</Label>
                <Input id="email-sd" type="email" className="font-sindhi text-lg" dir="rtl" value={programDetails.emailSindhi} onChange={(e) => handleInputChange('emailSindhi', e.target.value)}/>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button onClick={handleSubmitProgram} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Program Records</CardTitle>
            <CardDescription>A list of all submitted program invitations.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program Topic</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submittedPrograms.length > 0 ? (
                    submittedPrograms.map(program => (
                      <TableRow key={program.id}>
                        <TableCell className="font-medium">{program.programTopic}</TableCell>
                        <TableCell>{program.programDate}</TableCell>
                        <TableCell>{program.programTime}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No program records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
                <div>
                    <CardTitle>Contact & WhatsApp Settings</CardTitle>
                    <CardDescription>Add contacts and configure WhatsApp for sending invitations.</CardDescription>
                </div>
                <div className="space-y-2">
                     <div className="flex items-center gap-2">
                        <Input 
                            id="whatsapp-api-key" 
                            type="password"
                            placeholder="WhatsApp API Key" 
                            value={whatsappApiKey}
                            onChange={(e) => setWhatsappApiKey(e.target.value)}
                        />
                    </div>
                     <Button onClick={handleSaveWhatsapp} className="w-full">Save Settings</Button>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input id="contact-name" value={newContactName} onChange={e => setNewContactName(e.target.value)} placeholder="e.g., John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" value={newContactEmail} onChange={e => setNewContactEmail(e.target.value)} placeholder="e.g., john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone Number</Label>
              <Input id="contact-phone" type="tel" value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} placeholder="e.g., 0300-1234567" />
            </div>
            <Button onClick={handleAddContact} className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Contact
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length > 0 ? (
                contacts.map(contact => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No contacts added yet.
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
