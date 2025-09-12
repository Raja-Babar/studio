
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
  ChevronDown,
  File,
  Library,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/user-management', icon: Users, label: 'User Management' },
  { href: '/dashboard/attendance', icon: CalendarCheck, label: 'Attendance' },
];

const itScanningItems = [
    { href: '/dashboard/scanning', icon: ScanLine, label: 'Digitization Progress' },
    { href: '/dashboard/employee-reports', icon: FileSignature, label: 'Digitization Report' },
];

const administrationItems = [
    { href: '/dashboard/salaries', icon: DollarSign, label: 'Salaries' },
    { href: '/dashboard/petty-cash', icon: Wallet, label: 'Petty Cash' },
];

const appFileItems = [
    { href: '/dashboard/report-assistant', icon: Sparkles, label: 'Report Assistant' },
    { href: '/dashboard/reporting', icon: FileText, label: 'Reporting' },
];

const publicationItems = [
  { href: '/dashboard/library', icon: Library, label: 'Auto-Generate-Bill' },
  { href: '/dashboard/publications', icon: BookOpen, label: 'Bills-Records' },
];

const otherNavItems = [
  { href: '/dashboard/projects', icon: Briefcase, label: 'Projects' },
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
  
  const [isItSectionOpen, setIsItSectionOpen] = useState(
    pathname.startsWith('/dashboard/scanning') || pathname.startsWith('/dashboard/employee-reports')
  );
  
  const [isAdministrationSectionOpen, setIsAdministrationSectionOpen] = useState(
    pathname.startsWith('/dashboard/salaries') || pathname.startsWith('/dashboard/petty-cash')
  );
  
  const [isPublicationSectionOpen, setIsPublicationSectionOpen] = useState(
    pathname.startsWith('/dashboard/library') || pathname.startsWith('/dashboard/publications')
  );
  
  const [isAppFileSectionOpen, setIsAppFileSectionOpen] = useState(
    pathname.startsWith('/dashboard/report-assistant') || pathname.startsWith('/dashboard/reporting')
  );
  
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

            <Collapsible open={isItSectionOpen} onOpenChange={setIsItSectionOpen} className="w-full">
                <CollapsibleTrigger asChild>
                    <div className='w-full'>
                        <SidebarMenuButton className='w-full justify-between' isActive={isItSectionOpen}>
                            <div className="flex items-center gap-2">
                                <ScanLine />
                                <span>I.T & Scanning-Section</span>
                            </div>
                            <ChevronDown className={cn('h-4 w-4 transition-transform', isItSectionOpen && 'rotate-180')} />
                        </SidebarMenuButton>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="py-1 pl-6">
                     <SidebarMenu>
                        {itScanningItems.map((item, index) => (
                            <SidebarMenuItem key={`${item.href}-${index}`}>
                                <Link href={item.href}>
                                <SidebarMenuButton
                                    isActive={pathname.startsWith(item.href)}
                                    tooltip={item.label}
                                    className="h-8"
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>
            
            <Collapsible open={isAdministrationSectionOpen} onOpenChange={setIsAdministrationSectionOpen} className="w-full">
                <CollapsibleTrigger asChild>
                    <div className='w-full'>
                        <SidebarMenuButton className='w-full justify-between' isActive={isAdministrationSectionOpen}>
                            <div className="flex items-center gap-2">
                                <Wallet />
                                <span>Administration-Section</span>
                            </div>
                            <ChevronDown className={cn('h-4 w-4 transition-transform', isAdministrationSectionOpen && 'rotate-180')} />
                        </SidebarMenuButton>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="py-1 pl-6">
                     <SidebarMenu>
                        {administrationItems.map((item, index) => (
                            <SidebarMenuItem key={`${item.href}-${index}`}>
                                <Link href={item.href}>
                                <SidebarMenuButton
                                    isActive={pathname.startsWith(item.href)}
                                    tooltip={item.label}
                                    className="h-8"
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>
            
            <Collapsible open={isPublicationSectionOpen} onOpenChange={setIsPublicationSectionOpen} className="w-full">
                <CollapsibleTrigger asChild>
                    <div className='w-full'>
                        <SidebarMenuButton className='w-full justify-between' isActive={isPublicationSectionOpen}>
                            <div className="flex items-center gap-2">
                                <BookOpen />
                                <span>Publication-Section</span>
                            </div>
                            <ChevronDown className={cn('h-4 w-4 transition-transform', isPublicationSectionOpen && 'rotate-180')} />
                        </SidebarMenuButton>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="py-1 pl-6">
                     <SidebarMenu>
                        {publicationItems.map((item, index) => (
                            <SidebarMenuItem key={`${item.href}-${index}`}>
                                <Link href={item.href}>
                                <SidebarMenuButton
                                    isActive={pathname.startsWith(item.href)}
                                    tooltip={item.label}
                                    className="h-8"
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>

            {otherNavItems.map((item, index) => (
                <SidebarMenuItem key={`${item.href}-${index}`}>
                    <Link href={item.href}>
                    <SidebarMenuButton
                        isActive={pathname.startsWith(item.href)}
                        tooltip={item.label}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}

            <Collapsible open={isAppFileSectionOpen} onOpenChange={setIsAppFileSectionOpen} className="w-full">
                <CollapsibleTrigger asChild>
                    <div className='w-full'>
                        <SidebarMenuButton className='w-full justify-between' isActive={isAppFileSectionOpen}>
                            <div className="flex items-center gap-2">
                                <File />
                                <span>App File</span>
                            </div>
                            <ChevronDown className={cn('h-4 w-4 transition-transform', isAppFileSectionOpen && 'rotate-180')} />
                        </SidebarMenuButton>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="py-1 pl-6">
                     <SidebarMenu>
                        {appFileItems.map((item, index) => (
                            <SidebarMenuItem key={`${item.href}-${index}`}>
                                <Link href={item.href}>
                                <SidebarMenuButton
                                    isActive={pathname.startsWith(item.href)}
                                    tooltip={item.label}
                                    className="h-8"
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
      </SidebarContent>
  )
}
