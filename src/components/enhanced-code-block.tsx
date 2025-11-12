"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Copy, 
  Check, 
  Download as DownloadIcon,
  Play, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Code,
  Terminal
} from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  collapsible?: boolean;
  maxHeight?: number;
  theme?: 'light' | 'dark' | 'auto';
  showCopy?: boolean;
  showExecute?: boolean;
  showDownload?: boolean;
  dependencies?: string[];
  livePreview?: boolean;
  showLanguage?: boolean;
}

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
}

export function EnhancedCodeBlock({
  code,
  language = 'typescript',
  title,
  filename,
  showLineNumbers = true,
  highlightLines = [],
  collapsible = false,
  maxHeight,
  theme = 'auto',
  showCopy = true,
  showExecute = false,
  showDownload = false,
  dependencies = [],
  livePreview = false,
  showLanguage = true
}: CodeBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const codeRef = useRef<HTMLPreElement>(null);
  
  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setCurrentTheme(theme === 'dark' ? 'dark' : 'light');
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Syntax highlighting
  const highlightedCode = useMemo(() => {
    return highlightCode(code, language, highlightLines, currentTheme);
  }, [code, language, highlightLines, currentTheme]);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };
  
  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const result = await executeCode(code, language, dependencies);
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        success: false,
        error: error.message,
        output: null
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      html: 'html',
      css: 'css',
      json: 'json',
      sql: 'sql',
      bash: 'sh',
      markdown: 'md'
    };
    return extensions[lang] || 'txt';
  };
  
  const getLanguageIcon = (lang: string) => {
    const icons: Record<string, React.ComponentType> = {
      typescript: Code,
      javascript: Code,
      python: Terminal,
      html: Code,
      css: Code,
      json: Code,
      sql: Terminal,
      bash: Terminal
    };
    return icons[lang] || Code;
  };
  
  const LanguageIcon = getLanguageIcon(language);
  
  return (
    <div className="enhanced-code-block">
      {/* Header */}
      {(title || filename || showLanguage || showCopy || showExecute || showDownload) && (
        <div className="code-block-header">
          <div className="code-block-title-section">
            {filename && (
              <div className="code-filename">
                <LanguageIcon className="h-4 w-4" />
                <span className="ml-2">{filename}</span>
              </div>
            )}
            {title && !filename && (
              <div className="code-title">
                <LanguageIcon className="h-4 w-4" />
                <span className="ml-2">{title}</span>
              </div>
            )}
            {showLanguage && !title && !filename && (
              <Badge variant="outline" className="code-language-badge">
                <LanguageIcon className="h-3 w-3 mr-1" />
                {language}
              </Badge>
            )}
          </div>
          
          <div className="code-block-actions">
            {showExecute && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExecute}
                disabled={isExecuting}
                className="execute-button"
              >
                {isExecuting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isExecuting ? 'Running...' : 'Run'}
              </Button>
            )}
            
            {showDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="download-button"
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
            )}
            
            {showCopy && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="copy-button"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            )}
            
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="collapse-button"
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Code Content */}
      <div 
        className={`code-block-content ${isCollapsed ? 'collapsed' : ''}`}
        style={{ maxHeight: isCollapsed ? 0 : maxHeight }}
      >
        <pre 
          ref={codeRef}
          className={`language-${language} ${showLineNumbers ? 'show-line-numbers' : ''} theme-${currentTheme}`}
        >
          <code 
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className="code-content"
          />
        </pre>
      </div>
      
      {/* Execution Result */}
      {executionResult && (
        <div className="execution-result">
          <div className="execution-result-header">
            <div className="flex items-center gap-2">
              <span className="execution-result-title">
                {executionResult.success ? 'Output' : 'Error'}
              </span>
              <Badge 
                variant={executionResult.success ? 'default' : 'destructive'}
                className="execution-status"
              >
                {executionResult.success ? 'Success' : 'Failed'}
              </Badge>
              {executionResult.executionTime && (
                <span className="execution-time">
                  {executionResult.executionTime}ms
                </span>
              )}
            </div>
          </div>
          <pre className="execution-result-content">
            {executionResult.success ? executionResult.output : executionResult.error}
          </pre>
        </div>
      )}
      
      {/* Live Preview */}
      {livePreview && executionResult?.success && executionResult.output && (
        <div className="live-preview">
          <div className="live-preview-header">
            <div className="flex items-center gap-2">
              <span className="live-preview-title">Live Preview</span>
              <Badge variant="outline" className="preview-badge">
                Interactive
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newWindow = window.open();
                if (newWindow && executionResult.output) {
                  newWindow.document.write(executionResult.output);
                  newWindow.document.close();
                }
              }}
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
          <div className="live-preview-content">
            <iframe
              srcDoc={executionResult.output}
              className="preview-iframe"
              sandbox="allow-scripts"
              title="Live Preview"
            />
          </div>
        </div>
      )}
      
      {/* Dependencies */}
      {dependencies.length > 0 && (
        <div className="code-dependencies">
          <div className="dependencies-header">
            <span className="dependencies-title">Dependencies</span>
          </div>
          <div className="dependencies-list">
            {dependencies.map((dep, index) => (
              <Badge key={index} variant="secondary" className="dependency-badge">
                {dep}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Syntax highlighting function (simplified version)
function highlightCode(code: string, language: string, highlightLines: number[], theme: 'light' | 'dark'): string {
  // This is a simplified syntax highlighter
  // In a real implementation, you'd use a library like Prism.js or highlight.js
  
  const lines = code.split('\n');
  const highlightedLines = lines.map((line, index) => {
    const lineNumber = index + 1;
    const isHighlighted = highlightLines.includes(lineNumber);
    
    // Basic syntax highlighting
    let highlightedLine = line
      .replace(/\b(function|const|let|var|if|else|return|import|export|from|class|extends|implements)\b/g, 
        '<span class="keyword">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, 
        '<span class="boolean">$1</span>')
      .replace(/\b\d+\b/g, 
        '<span class="number">$&</span>')
      .replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, 
        '<span class="string">$&</span>')
      .replace(/(\/\/.*$)/g, 
        '<span class="comment">$1</span>');
    
    return `<span class="line ${isHighlighted ? 'highlighted' : ''}" data-line="${lineNumber}">
      <span class="line-number">${lineNumber}</span>
      <span class="line-content">${highlightedLine}</span>
    </span>`;
  });
  
  return highlightedLines.join('\n');
}

// Mock code execution function
async function executeCode(code: string, language: string, dependencies: string[]): Promise<ExecutionResult> {
  // This is a mock implementation
  // In a real scenario, you'd send this to a sandbox environment
  
  const startTime = Date.now();
  
  try {
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let output = '';
    
    if (language === 'html') {
      output = code;
    } else if (language === 'javascript' || language === 'typescript') {
      // Simple evaluation for demo purposes
      try {
        const func = new Function(code);
        const result = func();
        output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          executionTime: Date.now() - startTime
        };
      }
    } else {
      output = `Code executed successfully in ${language}`;
    }
    
    return {
      success: true,
      output,
      executionTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      executionTime: Date.now() - startTime
    };
  }
}