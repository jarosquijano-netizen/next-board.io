'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with dark on server to avoid hydration mismatch
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted
    setMounted(true);
    
    // Load theme from localStorage after mount
    try {
      const saved = localStorage.getItem('nextboard-theme');
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      }
    } catch (e) {
      console.error('Error reading theme from localStorage:', e);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply theme
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
    
    // Save to localStorage
    try {
      localStorage.setItem('nextboard-theme', theme);
    } catch (e) {
      console.error('Error saving theme to localStorage:', e);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      console.log('Theme toggled to:', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

