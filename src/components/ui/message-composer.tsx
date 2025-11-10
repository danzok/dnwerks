"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Bold, 
  Italic, 
  Smile, 
  Hash, 
  DollarSign, 
  User, 
  Calendar,
  Type
} from "lucide-react"

interface MessageComposerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  showPreview?: boolean
  variables?: Array<{ name: string; value: string; icon?: React.ReactNode }>
  className?: string
}

const MessageComposer = React.forwardRef<HTMLTextAreaElement, MessageComposerProps>(
  ({ 
    className, 
    value, 
    onChange, 
    placeholder = "Type your message...", 
    maxLength = 160,
    showPreview = true,
    variables = [
      { name: "firstName", value: "John", icon: <User className="h-3 w-3" /> },
      { name: "lastName", value: "Doe", icon: <User className="h-3 w-3" /> },
      { name: "company", value: "Acme Corp", icon: <Hash className="h-3 w-3" /> },
      { name: "amount", value: "$100", icon: <DollarSign className="h-3 w-3" /> },
      { name: "date", value: "Jan 15", icon: <Calendar className="h-3 w-3" /> },
    ],
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    
    const characterCount = value.length
    const isNearLimit = characterCount > maxLength * 0.8
    const isOverLimit = characterCount > maxLength
    
    const getCharacterCounterClass = () => {
      if (isOverLimit) return "character-counter-danger"
      if (isNearLimit) return "character-counter-warning"
      return "character-counter-safe"
    }
    
    const insertVariable = (variable: string) => {
      const newValue = value + `{${variable}}`
      onChange(newValue)
    }
    
    const previewMessage = React.useMemo(() => {
      let preview = value
      variables.forEach(variable => {
        const regex = new RegExp(`\\{${variable.name}\\}`, 'g')
        preview = preview.replace(regex, variable.value)
      })
      return preview
    }, [value, variables])

    return (
      <div className={cn("space-y-4", className)}>
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Type className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Smile className="h-4 w-4" />
          </Button>
          
          <div className="h-4 w-px bg-gray-300 mx-1" />
          
          {/* Variable Buttons */}
          <div className="flex items-center gap-1 flex-wrap">
            {variables.map((variable) => (
              <Button
                key={variable.name}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => insertVariable(variable.name)}
              >
                {variable.icon}
                <span className="ml-1">{variable.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="relative">
          <textarea
            ref={ref}
            className={cn(
              "w-full min-h-[120px] px-4 py-3 border border-gray-200 rounded-lg bg-white text-foreground placeholder:text-muted-foreground transition-all duration-200 resize-none",
              isFocused && "ring-2 ring-primary/20 border-primary",
              isOverLimit && "border-red-300 ring-red-500/20",
              className
            )}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {/* Character Counter */}
          <div className={cn(
            "absolute bottom-3 right-3 text-sm font-medium px-2 py-1 rounded bg-white/90 backdrop-blur-sm",
            getCharacterCounterClass()
          )}>
            {characterCount}/{maxLength}
          </div>
        </div>

        {/* Preview */}
        {showPreview && value && (
          <div className="space-y-2">
            <label className="form-label">Preview</label>
            <div className="message-preview">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">SMS</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {previewMessage || placeholder}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200">
                    <span className="text-xs text-muted-foreground">
                      {previewMessage.length} characters
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

MessageComposer.displayName = "MessageComposer"

export { MessageComposer }