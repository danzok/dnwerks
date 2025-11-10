"use client"

import { useEffect, useState } from "react"
import { ModeToggle } from "./mode-toggle"
import { Button } from "@/components/ui/button"
import { Moon, SunMedium } from "lucide-react"

export function ClientSafeModeToggle() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Return a static button during SSR to prevent hydration mismatches
    return (
      <Button 
        variant="outline" 
        size="icon" 
        className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10"
        suppressHydrationWarning
      >
        <SunMedium className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem] lg:h-[1.2rem] lg:w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return <ModeToggle />
}