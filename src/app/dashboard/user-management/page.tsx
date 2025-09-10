
// src/app/dashboard/user-management/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type User = {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Employee';
};

export default function UserManagementPage() {
  const { user, getUsers, deleteUser, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedRole, setEditedRole] = useState<'Admin' | 'Employee'>('Employee');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());


  useEffect(() => {
    if (user?.role !== 'Admin') {
      router.replace('/dashboard');
    } else {
      setAllUsers(getUsers());
    }
  }, [user, router, getUsers]);
  
  const handleExport = () => {
    const doc = new jsPDF();
    doc.text('Panhwar Portal Users Report', 14, 16);
    (doc as any).autoTable({
        head: [['ID', 'Name', 'Role', 'Email']],
        body: allUsers.map(u => [u.id, u.name, u.role, u.email]),
        startY: 20
    });
    doc.save('panhwar_portal_users.pdf');
    toast({ title: 'Success', description: 'User data exported successfully as PDF.' });
  };

  const handleDelete = async (email: string) => {
    if (user?.email === email) {
      toast({ variant: 'destructive', title: 'Action Forbidden', description: 'You cannot delete your own account.' });
      return;
    }
    await deleteUser(email);
    setAllUsers(getUsers());
    toast({ title: 'User Deleted', description: 'The user has been successfully deleted.' });
  };

  const handleEditClick = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditedName(userToEdit.name);
    setEditedRole(userToEdit.role);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdate = async () => {
    if (selectedUser) {
      if (selectedUser.email === 'admin@example.com' && editedRole !== 'Admin') {
          toast({ variant: 'destructive', title: 'Update Failed', description: 'Cannot change the role of the primary admin.' });
          return;
      }
      await updateUser(selectedUser.email, { name: editedName, role: editedRole });
      setAllUsers(getUsers());
      toast({ title: 'User Updated', description: 'User information has been updated.' });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    }
  };


  if (user?.role !== 'Admin') {
    return null;
  }

  const handleMonthChange = (month: string) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(month, 10));
    newDate.setDate(1); 
    setSelectedDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(year, 10));
    newDate.setDate(1); 
    setSelectedDate(newDate);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 16 }, (_, i) => currentYear + 5 - i);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i, name: new Date(0, i).toLocaleString('en-US', { month: 'long' }) }));


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          View, export, and manage portal users.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
                <CardTitle>All Users</CardTitle>
                <CardDescription>A list of all registered users in the system.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <Select onValueChange={handleMonthChange} defaultValue={selectedDate.getMonth().toString()}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map(month => (
                            <SelectItem key={month.value} value={month.value.toString()}>{month.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select onValueChange={handleYearChange} defaultValue={selectedDate.getFullYear().toString()}>
                    <SelectTrigger className="w-full md:w-[120px]">
                        <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleExport} className="w-full md:w-auto">
                    <Download className="mr-2 h-4 w-4" /> Export PDF
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((u) => (
                <TableRow key={u.email}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'Admin' ? 'destructive' : 'secondary'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(u)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" disabled={user.email === u.email}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete the user <span className="font-semibold">{u.name}</span>? This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(u.email)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user's profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" value={selectedUser?.email || ''} className="col-span-3" disabled />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
               <Select onValueChange={(value) => setEditedRole(value as 'Admin' | 'Employee')} defaultValue={editedRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleUpdate}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
