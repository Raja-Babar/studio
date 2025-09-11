
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  CalendarCheck,
  Wallet,
  DollarSign,
  Briefcase,
  BookOpen,
  ScanLine,
  Sparkles,
  Users,
  FileText,
  FileSignature,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/user-management', icon: Users, label: 'User Management' },
  { href: '/dashboard/attendance', icon: CalendarCheck, label: 'Attendance' },
  { href: '/dashboard/scanning', icon: ScanLine, label: 'I.T & Scanning-Section' },
  { href: '/dashboard/employee-reports', icon: FileSignature, label: 'Digitization Report' },
  { href: '/dashboard/salaries', icon: DollarSign, label: 'Salaries' },
  { href: '/dashboard/petty-cash', icon: Wallet, label: 'Petty Cash' },
  { href: '/dashboard/projects', icon: Briefcase, label: 'Projects' },
  { href: '/dashboard/publications', icon: BookOpen, label: 'Publications' },
  { href: '/dashboard/report-assistant', icon: Sparkles, label: 'Report Assistant' },
  { href: '/dashboard/reporting', icon: FileText, label: 'Reporting' },
];

const employeeNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/attendance', icon: CalendarCheck, label: 'Attendance' },
  { href: '/dashboard/employee-reports', icon: FileSignature, label: 'Digitization Report' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  if (!isAdmin) {
    return (
       <SidebarContent className="p-2">
          <SidebarMenu>
              {employeeNavItems.map((item, index) => (
              <SidebarMenuItem key={`${item.href}-${index}`}>
                  <Link href={item.href}>
                  <SidebarMenuButton
                      isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                      tooltip={item.label}
                  >
                      <item.icon />
                      <span>{item.label}</span>
                  </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
              ))}
          </SidebarMenu>
      </SidebarContent>
    );
  }

  return (
      <SidebarContent className="p-2">
          <SidebarMenu>
              {mainNavItems.map((item, index) => (
              <SidebarMenuItem key={`${item.href}-${index}`}>
                  <Link href={item.href}>
                  <SidebarMenuButton
                      isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                      tooltip={item.label}
                  >
                      <item.icon />
                      <span>{item.label}</span>
                  </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
              ))}
          </SidebarMenu>
      </SidebarContent>
  )
}
