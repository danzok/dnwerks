"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  ChevronDown, 
  Expand, 
  Clock,
  CheckCircle2,
  Menu,
  X
} from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
  children?: TocItem[];
  badge?: string;
  estimatedTime?: number;
}

interface InteractiveTocProps {
  headings: TocItem[];
  activeHeading: string;
  onHeadingClick: (id: string) => void;
  className?: string;
}

export function InteractiveToc({ 
  headings, 
  activeHeading, 
  onHeadingClick,
  className = ""
}: InteractiveTocProps) {
  const [expandedSections, setExpandedSections] = useState(new Set(['h1']));
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);
  
  const toggleSection = (headingId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(headingId)) {
      newExpanded.delete(headingId);
    } else {
      newExpanded.add(headingId);
    }
    setExpandedSections(newExpanded);
  };
  
  const expandAll = () => {
    const allIds = headings.map(h => h.id);
    setExpandedSections(new Set(allIds));
  };
  
  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      const offset = 80; // Header height offset
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      onHeadingClick(headingId);
    }
  };
  
  const calculateReadingProgress = () => {
    if (!activeHeading || headings.length === 0) return 0;
    
    const currentIndex = headings.findIndex(h => h.id === activeHeading);
    return Math.round(((currentIndex + 1) / headings.length) * 100);
  };
  
  const renderHeading = (heading: TocItem, level = 0) => {
    const isActive = activeHeading === heading.id;
    const hasChildren = heading.children && heading.children.length > 0;
    const isExpanded = expandedSections.has(heading.id);
    
    return (
      <div key={heading.id} className={`toc-item level-${level}`}>
        <div className="toc-item-content">
          <button
            className={`toc-link ${isActive ? 'active' : ''}`}
            onClick={() => scrollToHeading(heading.id)}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            {hasChildren && (
              <ChevronRight
                className={`toc-chevron ${isExpanded ? 'expanded' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection(heading.id);
                }}
              />
            )}
            <span className="toc-text">{heading.text}</span>
            {heading.badge && (
              <Badge variant="outline" className="toc-badge">
                {heading.badge}
              </Badge>
            )}
            {heading.estimatedTime && (
              <span className="toc-time">
                <Clock className="h-3 w-3" />
                {heading.estimatedTime}m
              </span>
            )}
          </button>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="toc-children">
            {heading.children?.map(child => renderHeading(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`interactive-toc ${className}`} ref={tocRef}>
      {/* Desktop Version */}
      <div className="hidden md:block">
        <div className="toc-header">
          <h3 className="toc-title">Table of Contents</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            className="expand-all-button"
          >
            <Expand className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="toc-content">
          {headings.map(heading => renderHeading(heading))}
        </div>
        
        <div className="toc-footer">
          <Progress value={calculateReadingProgress()} className="toc-progress" />
          <span className="toc-progress-text">
            {calculateReadingProgress()}% complete
          </span>
        </div>
      </div>
      
      {/* Mobile Version */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="mobile-toc-toggle"
        >
          <Menu className="h-4 w-4" />
          Table of Contents
        </Button>
        
        {isMobileOpen && (
          <div className="mobile-toc-overlay">
            <div className="mobile-toc-content">
              <div className="mobile-toc-header">
                <h3 className="toc-title">Table of Contents</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileOpen(false)}
                  className="mobile-toc-close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="toc-content">
                {headings.map(heading => renderHeading(heading))}
              </div>
              
              <div className="toc-footer">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={expandAll}
                  className="expand-all-button"
                >
                  <Expand className="h-4 w-4 mr-2" />
                  Expand All
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}