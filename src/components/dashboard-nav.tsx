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
  BookCopy,
  BookOpen,
  ScanLine,
  Sparkles,
  Users,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const adminNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/user-management', icon: Users, label: 'User Management' },
  { href: '/dashboard/attendance', icon: CalendarCheck, label: 'Attendance' },
  { href: '/dashboard/salaries', icon: DollarSign, label: 'Salaries' },
  { href: '/dashboard/petty-cash', icon: Wallet, label: 'Petty Cash' },
  { href: '/dashboard/projects', icon: Briefcase, label: 'Projects' },
  { href: '/dashboard/library', icon: BookCopy, label: 'Library' },
  { href: '/dashboard/publications', icon: BookOpen, label: 'Publications' },
  { href: '/dashboard/scanning', icon: ScanLine, label: 'I.T & Scanning' },
  { href: '/dashboard/report-assistant', icon: Sparkles, label: 'Report Assistant' },
  { href: '/dashboard/reporting', icon: FileText, label: 'Reporting' },
];

const employeeNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/attendance', icon: CalendarCheck, label: 'My Attendance' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = user?.role === 'Admin' ? adminNavItems : employeeNavItems;

  return (
    <SidebarContent className="p-2">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
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
