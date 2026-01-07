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
    
    // Sync with DOM state (set by ThemeScript) and localStorage
    try {
      // Check if dark class is present (set by ThemeScript)
      const hasDarkClass = document.documentElement.classList.contains('dark');
      
      // Also check localStorage
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
      
      // Determine actual theme: prefer DOM state, then localStorage, then default to dark
      let actualTheme: 'light' | 'dark' = 'dark';
      if (hasDarkClass) {
        // DOM says dark, use dark
        actualTheme = 'dark';
      } else if (saved === 'light') {
        // DOM says light (no dark class) and localStorage says light, use light
        actualTheme = 'light';
      } else if (saved === 'dark') {
        // DOM says light but localStorage says dark - sync to dark
        actualTheme = 'dark';
      }
      // Otherwise default to dark
      
      // Sync state with actual theme
      setTheme(actualTheme);
      
      // Ensure DOM and localStorage are in sync
      if (actualTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', actualTheme);
      
      console.log('🎨 Theme synced on mount:', actualTheme);
      console.log('🔍 Has dark class:', document.documentElement.classList.contains('dark'));
    } catch (e) {
      console.error('Error reading theme from localStorage:', e);
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply theme - Tailwind only uses 'dark' class
    // For light mode: remove 'dark' class (no class needed)
    // For dark mode: add 'dark' class
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.colorScheme = theme;
    
    // Save to localStorage (use 'theme' key to match ThemeScript)
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error('Error saving theme to localStorage:', e);
    }
    
    console.log('🎨 Theme applied:', theme);
    console.log('🔍 Has dark class:', root.classList.contains('dark'));
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

