
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

type Contact = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

type ProgramRecord = {
  id: number;
  topic: string;
  date: string;
  time: string;
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

  const [programTopic, setProgramTopic] = useState('');
  const [programDate, setProgramDate] = useState('');
  const [programTime, setProgramTime] = useState('');
  const [address, setAddress] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [programTopicSindhi, setProgramTopicSindhi] = useState('');
  const [programDateSindhi, setProgramDateSindhi] = useState('');
  const [programTimeSindhi, setProgramTimeSindhi] = useState('');
  const [addressSindhi, setAddressSindhi] = useState('');
  const [organizerSindhi, setOrganizerSindhi] = useState('');
  const [phoneSindhi, setPhoneSindhi] = useState('');
  const [emailSindhi, setEmailSindhi] = useState('');
  
  const [submittedPrograms, setSubmittedPrograms] = useState<ProgramRecord[]>([]);
  const [nextProgramId, setNextProgramId] = useState(1);


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
  
  const handleSubmitProgram = () => {
    if (!programTopic || !programDate || !programTime) {
      toast({
        variant: 'destructive',
        title: 'Missing Program Info',
        description: 'Please fill in the program topic, date, and time.',
      });
      return;
    }

    const newProgram: ProgramRecord = {
      id: nextProgramId,
      topic: programTopic,
      date: programDate,
      time: programTime,
    };
    setSubmittedPrograms(prev => [newProgram, ...prev]);
    setNextProgramId(prev => prev + 1);

    // Reset form fields
    setProgramTopic('');
    setProgramDate('');
    setProgramTime('');
    setAddress('');
    setOrganizer('');
    setPhone('');
    setEmail('');
    setProgramTopicSindhi('');
    setProgramDateSindhi('');
    setProgramTimeSindhi('');
    setAddressSindhi('');
    setOrganizerSindhi('');
    setPhoneSindhi('');
    setEmailSindhi('');

    toast({
      title: 'Program Submitted',
      description: `The program "${programTopic}" has been added to the records.`,
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
              <Input id="topic-en" type="text" value={programTopic} onChange={(e) => setProgramTopic(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-sd" className="font-sindhi text-lg text-right w-full block">پروگرام جو موضوع</Label>
              <Input id="topic-sd" type="text" className="font-sindhi text-lg" dir="rtl" value={programTopicSindhi} onChange={(e) => setProgramTopicSindhi(e.target.value)}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="date-en">Program Date</Label>
                <Input id="date-en" type="date" value={programDate} onChange={(e) => setProgramDate(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="date-sd" className="font-sindhi text-lg text-right w-full block">پروگرام جي تاريخ</Label>
                <Input id="date-sd" type="date" className="font-sindhi" value={programDateSindhi} onChange={(e) => setProgramDateSindhi(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-en">Program Time</Label>
              <Input id="time-en" type="time" value={programTime} onChange={(e) => setProgramTime(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="time-sd" className="font-sindhi text-lg text-right w-full block">ٿيندڙ پروگرام جو وقت</Label>
                <Input id="time-sd" type="time" className="font-sindhi text-lg" value={programTimeSindhi} onChange={(e) => setProgramTimeSindhi(e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-en">Address</Label>
              <Textarea id="address-en" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-sd" className="font-sindhi text-lg text-right w-full block">پتو</Label>
              <Textarea id="address-sd" className="font-sindhi text-lg" dir="rtl" value={addressSindhi} onChange={(e) => setAddressSindhi(e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizer-en">Organizer</Label>
              <Input id="organizer-en" type="text" value={organizer} onChange={(e) => setOrganizer(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="organizer-sd" className="font-sindhi text-lg text-right w-full block">پروگرام ڪندڙ</Label>
                <Input id="organizer-sd" type="text" className="font-sindhi text-lg" dir="rtl" value={organizerSindhi} onChange={(e) => setOrganizerSindhi(e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-en">Phone No</Label>
              <Input id="phone-en" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone-sd" className="font-sindhi text-lg text-right w-full block">فون نمبر</Label>
                <Input id="phone-sd" type="tel" className="font-sindhi text-lg" dir="rtl" value={phoneSindhi} onChange={(e) => setPhoneSindhi(e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-en">Email</Label>
              <Input id="email-en" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email-sd" className="font-sindhi text-lg text-right w-full block">اي ميل</Label>
                <Input id="email-sd" type="email" className="font-sindhi text-lg" dir="rtl" value={emailSindhi} onChange={(e) => setEmailSindhi(e.target.value)}/>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button onClick={handleSubmitProgram}>Submit</Button>
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
                        <TableCell className="font-medium">{program.topic}</TableCell>
                        <TableCell>{program.date}</TableCell>
                        <TableCell>{program.time}</TableCell>
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
                            id="whatsapp-number" 
                            placeholder="Admin's WhatsApp Number" 
                            value={adminWhatsapp}
                            onChange={(e) => setAdminWhatsapp(e.target.value)}
                        />
                    </div>
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
