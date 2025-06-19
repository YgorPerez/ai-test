
"use client";

import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  ClipboardList,
  BrainCircuit, // Using BrainCircuit for Nutrition Lookup AI
  BookCopy, // Using BookCopy for Recipe Suggestions AI
  ListChecks, // Using ListChecks for Goals
  CalendarDays,
  Utensils, // App icon
  Settings, // Placeholder for potential future settings
  Moon, 
  Sun,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  title: string;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, title: 'Nutritional Summary' },
  { href: '/tracker', label: 'Meal Tracker', icon: ClipboardList, title: 'Track Your Meals' },
  { href: '/nutrition-lookup', label: 'Nutrition Lookup', icon: BrainCircuit, title: 'Find Nutritional Info' },
  { href: '/recipes', label: 'Recipe Suggestions', icon: BookCopy, title: 'Get Recipe Ideas' },
  { href: '/goals', label: 'Set Goals', icon: ListChecks, title: 'Your Dietary Goals' },
  { href: '/history', label: 'History', icon: CalendarDays, title: 'Past Intake Logs' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentTitle, setCurrentTitle] = useState('Dashboard');
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('veggiepal-theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const activeItem = navItems.find(item => item.href === pathname);
    if (activeItem) {
      setCurrentTitle(activeItem.title);
    } else if (pathname === '/') {
        setCurrentTitle('Nutritional Summary');
    }
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('veggiepal-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Utensils className="h-16 w-16 animate-pulse text-primary" /></div>; // Or a proper skeleton loader
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-background">
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border shadow-md">
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2" aria-label="VeggiePal Home">
              <Utensils className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-headline font-semibold text-foreground group-data-[collapsible=icon]:hidden">
                VeggiePal
              </h1>
            </Link>
          </SidebarHeader>
          <SidebarContent asChild>
            <ScrollArea className="flex-grow">
              <SidebarMenu className="p-2 space-y-1">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <SidebarMenuButton
                        variant="default"
                        size="default"
                        className="w-full justify-start"
                        isActive={pathname === item.href}
                        tooltip={{ children: item.label, side: 'right', align: 'center' }}
                        aria-current={pathname === item.href ? 'page' : undefined}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarContent>
          <SidebarFooter className="p-2 border-t border-sidebar-border">
             <Separator className="my-2 group-data-[collapsible=icon]:hidden" />
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={toggleTheme}
                        tooltip={{ children: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, side: 'right', align: 'center' }}
                        aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                    >
                        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        <span className="group-data-[collapsible=icon]:hidden">
                            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <ScrollArea className="h-screen">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 py-2 backdrop-blur-md md:px-6">
                <h2 className="text-2xl md:text-3xl font-headline font-semibold text-foreground">
                {currentTitle}
                </h2>
                <SidebarTrigger className="md:hidden" asChild>
                    <Button variant="ghost" size="icon" aria-label="Toggle Sidebar">
                        <PanelLeftIcon className="h-6 w-6" />
                    </Button>
                </SidebarTrigger>
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
            </main>
          </ScrollArea>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

// Minimal PanelLeftIcon if not available or for consistency
function PanelLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <line x1="9" x2="9" y1="3" y2="21" />
    </svg>
  )
}
