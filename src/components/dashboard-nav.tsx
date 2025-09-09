
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
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
  Building2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/library', icon: BookCopy, label: 'Library' },
  { href: '/dashboard/scanning', icon: ScanLine, label: 'I.T & Scanning' },
];

const administrationNavItems = [
  { href: '/dashboard/user-management', icon: Users, label: 'User Management' },
  { href: '/dashboard/attendance', icon: CalendarCheck, label: 'Attendance' },
  { href: '/dashboard/salaries', icon: DollarSign, label: 'Salaries' },
  { href: '/dashboard/petty-cash', icon: Wallet, label: 'Petty Cash' },
];

const otherNavItems = [
  { href: '/dashboard/projects', icon: Briefcase, label: 'Projects' },
  { href: '/dashboard/publications', icon: BookOpen, label: 'Publications' },
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

  const isAdmin = user?.role === 'Admin';

  if (!isAdmin) {
    return (
        <SidebarContent className="p-2">
            <SidebarMenu>
                {employeeNavItems.map((item) => (
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
    )
  }

  const renderNavItems = (items: typeof mainNavItems) => {
    return items.map((item) => (
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
    ))
  }

  return (
    <SidebarContent className="p-0">
        <SidebarMenu className="p-2">
            {renderNavItems(mainNavItems)}
        </SidebarMenu>

        <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
                <Building2 />
                <span>Administration</span>
            </SidebarGroupLabel>
            <SidebarMenu>
                 {renderNavItems(administrationNavItems)}
            </SidebarMenu>
        </SidebarGroup>

        <SidebarMenu className="p-2">
            {renderNavItems(otherNavItems)}
        </SidebarMenu>

    </SidebarContent>
  );
}
