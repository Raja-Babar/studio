// src/app/dashboard/user-management/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


type User = {
    name: string;
    email: string;
    role: 'Admin' | 'Employee';
};

export default function UserManagementPage() {
  const { user, getUsers, importUsers, resetUsers } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.role !== 'Admin') {
      router.replace('/dashboard');
    } else {
      setAllUsers(getUsers());
    }
  }, [user, router, getUsers]);
  
  const handleExport = () => {
    const dataStr = JSON.stringify(getUsers(), null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'panhwar_portal_users.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({ title: 'Success', description: 'User data exported successfully.' });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const importedData = JSON.parse(text);
            // Simple validation
            if (Array.isArray(importedData) && importedData.every(u => u.name && u.email && u.role && u.password)) {
              await importUsers(importedData);
              setAllUsers(getUsers());
              toast({ title: 'Success', description: 'Users imported successfully. You may need to refresh for all changes to apply.' });
            } else {
              throw new Error('Invalid file format.');
            }
          }
        } catch (error) {
          toast({ variant: 'destructive', title: 'Import Failed', description: 'Could not import users. Please check the file format.' });
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleReset = async () => {
    await resetUsers();
    setAllUsers(getUsers());
    toast({ title: 'Success', description: 'User data has been reset to default.' });
  };


  if (user?.role !== 'Admin') {
    return null; // Or a loading/access denied component
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          View, export, and manage portal users.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>A list of all registered users in the system.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleImportClick}>
                    <Upload className="mr-2 h-4 w-4" /> Import
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="application/json"
                />
                <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Reset
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will reset all user data to the default settings, deleting any new users you have created. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReset}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((u) => (
                <TableRow key={u.email}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'Admin' ? 'destructive' : 'secondary'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
