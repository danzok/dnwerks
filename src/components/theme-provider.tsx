"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  customColors?: Record<string, string>;
  reducedMotion: boolean;
  highContrast: boolean;
}

interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  systemTheme: 'light' | 'dark';
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Partial<ThemeConfig>;
}

export function ThemeProvider({ children, defaultTheme = {} }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeConfig>({
    mode: 'auto',
    primaryColor: '#3b82f6',
    accentColor: '#10b981',
    reducedMotion: false,
    highContrast: false,
    ...defaultTheme
  });
  
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update theme function - moved before usage
  const updateTheme = (updates: Partial<ThemeConfig>) => {
    const updated = { ...theme, ...updates };
    setTheme(updated);
    localStorage.setItem('theme-preferences', JSON.stringify(updated));
  };

  // Detect system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches && !theme.reducedMotion) {
      updateTheme({ reducedMotion: true });
    }
  }, []);
  
  // Apply theme to document
  useEffect(() => {
    const effectiveTheme = theme.mode === 'auto' ? systemTheme : theme.mode;
    const root = document.documentElement;
    
    setIsTransitioning(true);
    
    // Add transition class for smooth theme switching
    root.classList.add('theme-transitioning');
    
    // Apply theme class
    root.setAttribute('data-theme', effectiveTheme);
    
    // Apply custom CSS variables
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    
    // Apply accessibility preferences
    root.setAttribute('data-reduced-motion', theme.reducedMotion.toString());
    root.setAttribute('data-high-contrast', theme.highContrast.toString());
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', 
        effectiveTheme === 'dark' ? '#0f172a' : '#ffffff'
      );
    }
    
    // Remove transition class after animation
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
      setIsTransitioning(false);
    }, 300);
  }, [theme, systemTheme]);
  
  // Load saved theme preferences
  useEffect(() => {
    const saved = localStorage.getItem('theme-preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTheme(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load theme preferences:', error);
      }
    }
  }, []);
  
  const value: ThemeContextType = {
    theme,
    updateTheme,
    systemTheme,
    isTransitioning
  };
  
  return (
    <ThemeContext.Provider value={value}>
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