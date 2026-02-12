'use client';

import React from 'react';
import { MobileNav } from './MobileNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  showBack=false, 
  actions 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {title && (
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {title}
            </h1>
            {actions && <div>{actions}</div>}
          </div>
        </header>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {children}
      </main>
      <MobileNav />
    </div>
  );
};
