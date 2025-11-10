"use client";

import * as React from "react";
import { JSX } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("font-sans", {
  variants: {
    variant: {
      h1: "text-4xl font-bold tracking-tighter leading-tight",
      h2: "text-3xl font-semibold tracking-tighter leading-tight",
      h3: "text-2xl font-semibold tracking-tight leading-snug",
      h4: "text-xl font-semibold tracking-tight leading-snug",
      h5: "text-lg font-medium tracking-tight leading-snug",
      h6: "text-base font-medium tracking-normal leading-normal",
      p: "text-base font-normal tracking-normal leading-relaxed",
      lead: "text-xl font-normal tracking-tight leading-relaxed text-muted-foreground",
      large: "text-lg font-semibold tracking-tight",
      small: "text-sm font-normal tracking-normal leading-normal",
      muted: "text-sm text-muted-foreground tracking-normal leading-normal",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: keyof JSX.IntrinsicElements;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, ...props }, ref) => {
    const Comp = as || getDefaultElement(variant);

    if (typeof Comp === 'string') {
      return React.createElement(
        Comp,
        {
          className: cn(typographyVariants({ variant, className })),
          ref,
          ...props,
        }
      );
    }

    return null;
  }
);

Typography.displayName = "Typography";

function getDefaultElement(variant: TypographyProps["variant"]): keyof JSX.IntrinsicElements {
  switch (variant) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return variant;
    case "lead":
    case "large":
    case "p":
    case "muted":
      return "p";
    case "small":
      return "small";
    case "code":
      return "code";
    default:
      return "p";
  }
}

export { Typography, typographyVariants };