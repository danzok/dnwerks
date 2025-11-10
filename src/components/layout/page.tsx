import * as React from "react"

export function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      {children}
    </div>
  )
}

export function PageHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full border-b bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between py-2">
          {children}
        </div>
      </div>
    </div>
  )
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-lg font-semibold tracking-tight sm:text-xl md:text-2xl lg:text-3xl">
      {children}
    </h1>
  )
}

export function PageDescription({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground sm:text-base">
      {children}
    </p>
  )
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-1 flex-col gap-4 sm:gap-6 lg:gap-8">
        {children}
      </div>
    </div>
  )
}
