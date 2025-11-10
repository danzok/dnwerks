"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "./app-sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export function ClientSafeSidebar(props: React.ComponentProps<typeof AppSidebar>) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Return a static skeleton during SSR to prevent hydration mismatches
    return (
      <div className="group/sidebar-wrapper flex h-full w-[--sidebar-width] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="flex flex-col gap-2 p-2">
          <div className="flex h-8 items-center gap-2 rounded-md px-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2">
          <div className="flex w-full min-w-0 flex-col gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex h-8 items-center gap-2 rounded-md px-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 p-2">
          <div className="flex h-12 items-center gap-2 rounded-md px-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <AppSidebar {...props} />
}