
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';

export default function AutoInvitationPage() {
  const { appLogo } = useAuth();
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
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic-en">Program Topic</Label>
              <Input id="topic-en" type="text" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="topic-sd" className="font-sindhi text-lg text-right w-full block">پروگرام جو موضوع</Label>
              <Input id="topic-sd" type="text" className="font-sindhi text-lg" dir="rtl"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-en">Program Date</Label>
              <Input id="date-en" type="date" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="date-sd" className="font-sindhi text-lg text-right w-full block">پروگرام جي تاريخ</Label>
                <Input id="date-sd" type="date" className="font-sindhi text-lg" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-en">Program Time</Label>
              <Input id="time-en" type="time" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="time-sd" className="font-sindhi text-lg text-right w-full block">ٿيندڙ پروگرام جو وقت</Label>
                <Input id="time-sd" type="time" className="font-sindhi text-lg"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-en">Address</Label>
              <Textarea id="address-en" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="address-sd" className="font-sindhi text-lg text-right w-full block">پتو</Label>
              <Textarea id="address-sd" className="font-sindhi text-lg" dir="rtl"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizer-en">Organizer</Label>
              <Input id="organizer-en" type="text" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="organizer-sd" className="font-sindhi text-lg text-right w-full block">پروگرام ڪندڙ</Label>
                <Input id="organizer-sd" type="text" className="font-sindhi text-lg" dir="rtl"/>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button>Submit</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
