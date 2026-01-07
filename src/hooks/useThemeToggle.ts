'use client';

import { useEffect, useState } from 'react';

export function useThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    
    setTheme(initialTheme);
    
    // Apply theme to DOM - Tailwind only needs 'dark' class
    // For LIGHT mode: NO class needed (remove 'dark')
    // For DARK mode: ADD 'dark' class
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    console.log('🎨 Initial theme applied:', initialTheme);
    console.log('🔍 Has dark class:', document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Tailwind dark mode: just toggle the 'dark' class
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    console.log('✅ Theme changed to:', newTheme);
    console.log('🔍 Has dark class:', document.documentElement.classList.contains('dark'));
  };

  return { theme, toggleTheme, mounted };
}

