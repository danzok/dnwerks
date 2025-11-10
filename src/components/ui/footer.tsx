"use client"

import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()}</span>
            <span>•</span>
            <span>Developed with</span>
            <Heart className="h-3 w-3 text-red-500 fill-current" />
            <span>by</span>
            <a 
              href="#" 
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              DNwerks
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span>SMS Campaign Management Platform</span>
          </div>
        </div>
      </div>
    </footer>
  )
}