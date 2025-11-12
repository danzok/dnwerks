"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronDown, X } from "lucide-react"

interface MultiSelectProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchable?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  searchable = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const handleClearAll = () => {
    onChange([])
  }

  const handleSelectAll = () => {
    onChange(options.map(option => option.value))
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333]"
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-sm text-[#666666] dark:text-[#888888]">
                {placeholder}
              </span>
            ) : (
              selected.map(value => {
                const option = options.find(opt => opt.value === value)
                return (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="mr-1 mb-1 bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#666666] dark:text-[#888888]"
                  >
                    {option?.label || value}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggle(value)
                      }}
                    />
                  </Badge>
                )
              })
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full p-0 bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] max-h-80 overflow-auto">
        <div className="p-2">
          {searchable && (
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 text-sm border rounded bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] mb-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
          <div className="flex justify-between p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="flex items-center p-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                onClick={() => handleToggle(option.value)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    selected.includes(option.value)
                      ? "text-black dark:text-white"
                      : "opacity-0"
                  }`}
                />
                <span className="text-sm text-black dark:text-white">
                  {option.label}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}