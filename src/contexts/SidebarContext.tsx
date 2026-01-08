'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  sidebarWidth: string;
  contentMargin: string; // Dynamic margin class for content
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem('sidebarCollapsed', String(newValue));
      return newValue;
    });
  };

  const sidebarWidth = isCollapsed ? '16' : '64';
  // Dynamic margin class: ml-16 (64px) when collapsed, ml-64 (256px) when expanded
  const contentMargin = isCollapsed ? 'lg:ml-16' : 'lg:ml-64';

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, sidebarWidth, contentMargin }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
