'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Database, 
  FileUp, 
  Building,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Define navigation items
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Data Management', href: '/data-management', icon: Database },
  { name: 'Upload Guide', href: '/upload-guide', icon: FileUp },
  { name: 'Company', href: '/company', icon: Building },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show loading state if user data is still loading
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <LayoutDashboard className="h-6 w-6 text-emerald-600" />
                <span className="font-bold text-xl">BLever.AI</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <nav className="flex space-x-4">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button 
                        variant={isActive ? "default" : "ghost"} 
                        className={cn(
                          "flex items-center space-x-2",
                          isActive ? "bg-emerald-600 hover:bg-emerald-700" : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
              </nav>
              
              {/* User button - Profile dropdown */}
              <UserButton afterSignOutUrl="/" />
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <Button
                variant="ghost"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium",
                      isActive 
                        ? "bg-emerald-600 text-white" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile user info */}
              <div className="border-t border-slate-200 pt-4 flex items-center px-3">
                <div className="flex-shrink-0">
                  <UserButton afterSignOutUrl="/" />
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}