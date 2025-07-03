'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppLayout } from './AppLayout';

interface ConditionalLayoutProps {
  children: ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Don't use AppLayout for auth pages
  const isAuthPage = pathname === '/auth' || pathname === '/verify-email';
  
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }
  
  return <AppLayout>{children}</AppLayout>;
} 