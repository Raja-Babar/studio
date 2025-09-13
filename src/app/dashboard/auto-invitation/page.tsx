
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';

export default function AutoInvitationPage() {

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
    <style jsx global>{`
        @media print {
          body > *:not(.printable-form) {
            display: none;
          }
          .printable-form {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
            padding: 2rem;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
    <div className="space-y-6 printable-form">
      <Card>
        <CardHeader className="text-center space-y-4">
          <h1 className="font-bold text-2xl">M.H. Panhwar Institute of Sindh Studies, Jamshoro</h1>
          <CardTitle className="font-sindhi text-3xl">ايم. ايڇ. پنھور انسٽيٽيوٽ آف سنڌ اسٽڊيز، ڄامشورو</CardTitle>
          <p className="text-lg text-muted-foreground">Information about the Program to be held in the Institute</p>
          <CardDescription className="font-sindhi text-xl">اداري ۾ ٿيندڙ پروگرام بابت ڄاڻ</CardDescription>
          <div className="flex justify-between items-center text-sm px-4">
            <span className="font-mono">MHIPSS(Program)/01/2025</span>
            <Button onClick={handlePrint} variant="outline" className="no-print">
              <Printer className="ml-2 h-4 w-4" />
              Print / پرنٽ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* English Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organizer-en">Organizer / Institute Name:</Label>
                  <Input id="organizer-en" type="text" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic-en">Program Topic:</Label>
                  <Input id="topic-en" type="text" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-en">Program Date:</Label>
                  <Input id="date-en" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-en">Program Time:</Label>
                  <Input id="time-en" type="time" />
                </div>
              </div>

              {/* Sindhi Form */}
              <div className="space-y-4" dir="rtl">
                <div className="space-y-2">
                  <Label htmlFor="organizer-sd" className="font-sindhi text-lg">پروگرام ڪندڙ / اداري جو نالو:</Label>
                  <Input id="organizer-sd" type="text" className="font-sindhi text-lg"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic-sd" className="font-sindhi text-lg">پروگرام جو موضوع:</Label>
                  <Input id="topic-sd" type="text" className="font-sindhi text-lg"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-sd" className="font-sindhi text-lg">ٿيندڙ پروگرام جي تاريخ:</Label>
                  <Input id="date-sd" type="date" className="font-sindhi text-lg"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-sd" className="font-sindhi text-lg">ٿيندڙ پروگرام جو وقت:</Label>
                  <Input id="time-sd" type="time" className="font-sindhi text-lg"/>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
