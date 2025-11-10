import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helper?: string
  error?: string
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  showPasswordToggle?: boolean
}

const EnhancedInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helper, error, icon, iconPosition = "left", showPasswordToggle, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    
    const inputType = showPasswordToggle && type === "password" 
      ? (showPassword ? "text" : "password") 
      : type

    const hasError = Boolean(error)
    const hasIcon = Boolean(icon)
    const hasPasswordToggle = showPasswordToggle && type === "password"

    return (
      <div className="space-y-2">
        {label && (
          <label className="form-label">
            {label}
          </label>
        )}
        
        <div className="relative">
          {hasIcon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              "form-input w-full",
              hasIcon && iconPosition === "left" && "pl-10",
              hasIcon && iconPosition === "right" && "pr-10",
              hasPasswordToggle && "pr-10",
              hasError && "border-red-300 ring-red-500/20",
              isFocused && "ring-2 ring-primary/20 border-primary",
              className
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {hasIcon && iconPosition === "right" && !hasPasswordToggle && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          
          {hasPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        
        {error && (
          <p className="form-error">
            {error}
          </p>
        )}
        
        {helper && !error && (
          <p className="form-helper">
            {helper}
          </p>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput }