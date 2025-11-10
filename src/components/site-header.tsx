import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ClientSafeModeToggle } from "@/components/client-safe-mode-toggle"

export function SiteHeader() {
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-10 sm:group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-10 sm:h-12 shrink-0 items-center gap-1 sm:gap-2 border-b bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between gap-1 px-3 sm:px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1 sm:gap-1 lg:gap-2 min-w-0 flex-1">
          <SidebarTrigger className="-ml-1 h-7 w-7 sm:h-8 sm:w-8" />
          <Separator
            orientation="vertical"
            className="mx-1 sm:mx-2 data-[orientation=vertical]:h-3 sm:data-[orientation=vertical]:h-4"
          />
          <h1 className="text-sm sm:text-base font-medium truncate">
            <span className="sm:hidden">DNwerks</span>
            <span className="hidden sm:inline">SMS Campaign Dashboard</span>
          </h1>
        </div>
        <div className="flex-shrink-0">
          <ClientSafeModeToggle />
        </div>
      </div>
    </header>
  )
}
