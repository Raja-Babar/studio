
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';

export default function AutoInvitationPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center space-y-4">
          <h1 className="font-bold text-2xl">M.H. Panhwar Institute of Sindh Studies, Jamshoro</h1>
          <CardTitle className="font-sindhi text-3xl">ايم. ايڇ. پنھور انسٽيٽيوٽ آف سنڌ اسٽڊيز، ڄامشورو</CardTitle>
          <p className="text-lg text-muted-foreground">Information about the Program to be held in the Institute</p>
          <CardDescription className="font-sindhi text-xl">اداري ۾ ٿيندڙ پروگرام بابت ڄاڻ</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8">
            <div className="flex justify-center">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                />
            </div>
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
                <Label htmlFor="time-en">Program Time:</Label>
                <Input id="time-en" type="time" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="address-en">Address:</Label>
                <Textarea id="address-en" />
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
                <Label htmlFor="time-sd" className="font-sindhi text-lg">ٿيندڙ پروگرام جو وقت:</Label>
                <Input id="time-sd" type="time" className="font-sindhi text-lg"/>
              </div>
               <div className="space-y-2">
                <Label htmlFor="address-sd" className="font-sindhi text-lg">پتو:</Label>
                <Textarea id="address-sd" className="font-sindhi text-lg" dir="rtl"/>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
