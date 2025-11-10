"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ClientSafeModeToggle } from "@/components/client-safe-mode-toggle"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <h1 className="text-sm font-semibold">DNwerks</h1>
          </div>
          <ClientSafeModeToggle />
        </div>
        
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left">Navigation</SheetTitle>
          </SheetHeader>
          {/* Navigation content would go here */}
        </SheetContent>
      </Sheet>
    </div>
  )
}