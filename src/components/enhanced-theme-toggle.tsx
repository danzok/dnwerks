"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { 
  Sun, 
  Moon, 
  Monitor, 
  ChevronDown,
  Check,
  Accessibility,
  Palette
} from "lucide-react";

export function EnhancedThemeToggle() {
  const { theme, updateTheme, systemTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentTheme = theme.mode === 'auto' ? systemTheme : theme.mode;
  
  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: Sun,
      description: 'Light theme with bright colors'
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: Moon,
      description: 'Dark theme with reduced eye strain'
    },
    {
      value: 'auto' as const,
      label: 'System',
      icon: Monitor,
      description: `Follow system preference (${systemTheme})`
    }
  ];
  
  const handleThemeChange = (mode: 'light' | 'dark' | 'auto') => {
    updateTheme({ mode });
    setIsOpen(false);
  };
  
  const handleAccessibilityToggle = (feature: 'reducedMotion' | 'highContrast') => {
    updateTheme({ 
      [feature]: !theme[feature] 
    });
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* Main Theme Toggle */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="theme-toggle">
            <div className="theme-toggle-icon">
              {currentTheme === 'light' && <Sun className="h-4 w-4" />}
              {currentTheme === 'dark' && <Moon className="h-4 w-4" />}
              {theme.mode === 'auto' && <Monitor className="h-4 w-4" />}
            </div>
            <span className="sr-only">Toggle theme</span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="theme-dropdown w-80">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4" />
              <h4 className="font-semibold">Theme</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Choose your preferred color scheme
            </p>
          </div>
          
          <div className="px-2 pb-2">
            {themeOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`theme-option ${theme.mode === option.value ? 'active' : ''}`}
              >
                <option.icon className="h-4 w-4" />
                <div className="flex-1 ml-3">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
                {theme.mode === option.value && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Accessibility Options */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Accessibility className="h-4 w-4" />
              <h4 className="font-semibold">Accessibility</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Customize your viewing experience
            </p>
          </div>
          
          <div className="px-2 pb-4 space-y-3">
            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-accent/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div>
                  <div className="font-medium text-sm">Reduced Motion</div>
                  <div className="text-xs text-muted-foreground">
                    Minimize animations and transitions
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleAccessibilityToggle('reducedMotion')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme.reducedMotion ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-accent/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div>
                  <div className="font-medium text-sm">High Contrast</div>
                  <div className="text-xs text-muted-foreground">
                    Increase color contrast for better visibility
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleAccessibilityToggle('highContrast')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme.highContrast ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {/* Theme Status */}
          <div className="px-4 py-3 border-t bg-accent/30">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {theme.mode === 'auto' ? 'Auto' : theme.mode}
                </Badge>
                {theme.reducedMotion && (
                  <Badge variant="secondary" className="text-xs">
                    Reduced Motion
                  </Badge>
                )}
                {theme.highContrast && (
                  <Badge variant="secondary" className="text-xs">
                    High Contrast
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground">
                {currentTheme === 'dark' ? '🌙' : '🌞'} {currentTheme}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}