"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "vertical" | "horizontal" | "responsive"
  }
>(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid gap-1.5",
      orientation === "horizontal" && "grid-cols-[auto_1fr] items-center gap-3",
      orientation === "responsive" && "@container/field-group grid gap-1.5",
      className
    )}
    {...props}
  />
))
Field.displayName = "Field"

const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-0.5", className)}
    {...props}
  />
))
FieldContent.displayName = "FieldContent"

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    {...props}
  />
))
FieldLabel.displayName = "FieldLabel"

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
FieldDescription.displayName = "FieldDescription"

const FieldError = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    errors?: Array<{ message?: string } | undefined>
  }
>(({ className, errors, children, ...props }, ref) => {
  if (errors && errors.length > 0) {
    return (
      <div
        ref={ref}
        className={cn("text-sm text-destructive", className)}
        {...props}
      >
        {errors.map((error, index) => (
          <div key={index}>{error?.message}</div>
        ))}
      </div>
    )
  }

  if (children) {
    return (
      <div
        ref={ref}
        className={cn("text-sm text-destructive", className)}
        {...props}
      >
        {children}
      </div>
    )
  }

  return null
})
FieldError.displayName = "FieldError"

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-6 @container/field-group", className)}
    {...props}
  />
))
FieldGroup.displayName = "FieldGroup"

const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.HTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  />
))
FieldSet.displayName = "FieldSet"

const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement> & {
    variant?: "legend" | "label"
  }
>(({ className, variant = "legend", ...props }, ref) => (
  <legend
    ref={ref}
    className={cn(
      variant === "legend" && "text-2xl font-semibold leading-none tracking-tight",
      variant === "label" && "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
FieldLegend.displayName = "FieldLegend"

const FieldTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn("text-sm font-medium leading-none", className)}
    {...props}
  />
))
FieldTitle.displayName = "FieldTitle"

const FieldSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative", className)}
    {...props}
  >
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    {children && (
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          {children}
        </span>
      </div>
    )}
  </div>
))
FieldSeparator.displayName = "FieldSeparator"

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
}