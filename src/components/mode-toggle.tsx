"use client"

import * as React from "react"
import { Moon, SunMedium } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10"
        >
          <SunMedium className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem] lg:h-[1.2rem] lg:w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem] lg:h-[1.2rem] lg:w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-36 sm:w-40"
        sideOffset={4}
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="cursor-pointer text-sm py-2 px-3"
        >
          <SunMedium className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="cursor-pointer text-sm py-2 px-3"
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="cursor-pointer text-sm py-2 px-3"
        >
          <div className="mr-2 h-4 w-4 rounded border-2 border-current" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}