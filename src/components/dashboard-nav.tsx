
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
  FileSignature,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
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
  { href: '/dashboard/employee-reports', icon: FileSignature, label: 'Employee Reports' },
];


const employeeNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/attendance', icon: CalendarCheck, label: 'My Attendance' },
  { href: '/dashboard/employee-reports', icon: FileSignature, label: 'My Reports' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdmin = user?.role === 'Admin';

  const navItems = isAdmin 
    ? [...mainNavItems, ...administrationNavItems, ...otherNavItems] 
    : employeeNavItems;

  const getFilteredNavItems = (items: typeof mainNavItems) => {
    if (isAdmin) {
      return items;
    }
    // For employees, filter which administration/other items they can see.
    // Currently, they only see their reports.
    const allowedEmployeeRoutes = ['/dashboard/employee-reports'];
    return items.filter(item => allowedEmployeeRoutes.includes(item.href));
  }
  
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
    <SidebarContent className="p-2">
        <SidebarMenu>
            {renderNavItems(mainNavItems)}
        </SidebarMenu>

        <SidebarGroup className="p-0 pt-2">
            <SidebarGroupLabel className="flex items-center gap-2 px-2">
                <Building2 />
                <span>Administration</span>
            </SidebarGroupLabel>
            <SidebarMenu className="pt-2">
                 {renderNavItems(administrationNavItems)}
            </SidebarMenu>
        </SidebarGroup>

        <SidebarMenu className="pt-2">
            {renderNavItems(getFilteredNavItems(otherNavItems))}
        </SidebarMenu>

    </SidebarContent>
  );
}
