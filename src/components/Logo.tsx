'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  width?: number;
  height?: number;
}

export default function Logo({ 
  className = '', 
  showTagline = true,
  width = 207, // Increased by 15% (180 * 1.15)
  height = 55  // Increased by 15% (48 * 1.15)
}: LogoProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check if dark class exists on html element
    const checkTheme = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(hasDarkClass);
      if (!mounted) setMounted(true);
    };
    
    // Initial check
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, [mounted]);
  
  // Don't render until mounted to prevent flash
  if (!mounted) {
    return (
      <div className={`flex items-center ${className}`} style={{ width: `${width}px`, height: `${height}px` }} />
    );
  }
  
  // In LIGHT theme show logo-light.png
  // In DARK theme show logo-dark.png
  const logoSrc = isDark ? '/images/logo-dark.png' : '/images/logo-light.png';
  
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        key={logoSrc}
        src={logoSrc}
        alt="NextBoard.ai - Where meetings become actions"
        width={width}
        height={height}
        priority
        style={{ width: 'auto', height: 'auto', maxHeight: `${height}px` }}
        className="object-contain"
      />
    </div>
  );
}

