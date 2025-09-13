
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
    <div className="space-y-6 printable-form" dir="rtl">
      <Card>
        <CardHeader className="text-center space-y-4">
          <CardTitle className="font-sindhi text-3xl">ايم. ايڇ. پنھور انسٽيٽيوٽ آف سنڌ اسٽڊيز، ڄامشورو</CardTitle>
          <CardDescription className="font-sindhi text-xl">اداري ۾ ٿيندڙ پروگرام بابت ڄاڻ</CardDescription>
          <div className="flex justify-between items-center text-sm px-4">
            <span className="font-mono">MHIPSS(Program)/01/2025</span>
            <Button onClick={handlePrint} variant="outline" className="no-print">
              <Printer className="ml-2 h-4 w-4" />
              پرنٽ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-400 font-sindhi text-lg">
                <tbody>
                  <tr className="border-b border-gray-400">
                    <td className="border-l border-gray-400 p-3 font-semibold">پروگرام ڪندڙ / اداري جو نالو:</td>
                    <td className="p-2">
                      <Input type="text" className="w-full bg-transparent border-none focus:ring-0 font-sindhi text-lg p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-400">
                    <td className="border-l border-gray-400 p-3 font-semibold">پروگرام جو موضوع:</td>
                    <td className="p-2">
                      <Input type="text" className="w-full bg-transparent border-none focus:ring-0 font-sindhi text-lg p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-400">
                    <td className="border-l border-gray-400 p-3 font-semibold">ٿيندڙ پروگرام جي تاريخ:</td>
                    <td className="p-2">
                      <Input type="date" className="w-full bg-transparent border-none focus:ring-0 font-sindhi text-lg p-1" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-400">
                    <td className="border-l border-gray-400 p-3 font-semibold">ٿيندڙ پروگرام جو وقت:</td>
                    <td className="p-2">
                      <Input type="time" className="w-full bg-transparent border-none focus:ring-0 font-sindhi text-lg p-1" />
                    </td>
                  </tr>
                  <tr>
                    <td className="border-l border-gray-400 p-3 font-semibold">شرڪت ڪندڙ ماڻهن جو تعداد:</td>
                    <td className="p-2">
                      <Input type="number" className="w-full bg-transparent border-none focus:ring-0 font-sindhi text-lg p-1" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
