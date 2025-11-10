"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Send, Link as LinkIcon, Users, Calendar, Clock, Filter, Wand2, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { TemplateSelector } from "./template-selector"
import { CampaignTemplate } from "@/lib/schema"
import { CampaignTemplateUI } from "@/lib/ui-types"
import { useTemplates } from "@/hooks/use-templates"
import { useCampaigns } from "@/hooks/use-campaigns"

export function CampaignForm() {
  const router = useRouter()
  const { createCampaign } = useCampaigns()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showShortLinkModal, setShowShortLinkModal] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false)
  const [shortLinkUrl, setShortLinkUrl] = useState("")
  const [generatedShortLink, setGeneratedShortLink] = useState("")
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)

  // Validation states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({})
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  
  // Template form data
  const [templateFormData, setTemplateFormData] = useState({
    name: "",
    description: "",
    category: "general" as const,
    isPublic: false,
  })

  const { createTemplate } = useTemplates()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    messageBody: "",
    recipients: "all", // "all" or "filtered"
    sendTiming: "now", // "now" or "scheduled"
    scheduledDate: "",
    scheduledTime: "",
    selectedStates: [] as string[],
  })

  // Mock contacts data
  const totalContacts = 1234
  const stateCounts = {
    "All": 1234,
    "CA": 245,
    "NY": 189,
    "TX": 156,
    "FL": 134,
    "IL": 98,
    "PA": 87,
    "OH": 76,
    "GA": 65,
    "NC": 54,
    "MI": 43,
    "NJ": 32,
    "VA": 28,
    "WA": 27,
    "AZ": 25,
    "MA": 23
  }

  const characterLimit = 160
  const characterCount = formData.messageBody.length
  const charactersRemaining = characterLimit - characterCount

  // Validation functions
  const validateField = useCallback((fieldName: string, value: string | string[] | undefined): string | null => {
    switch (fieldName) {
      case 'name':
        const nameValue = Array.isArray(value) ? value.join(' ') : value
        if (!nameValue?.trim()) return 'Campaign name is required'
        if (nameValue.trim().length < 3) return 'Campaign name must be at least 3 characters'
        if (nameValue.trim().length > 100) return 'Campaign name must be less than 100 characters'
        return null

      case 'messageBody':
        const messageValue = Array.isArray(value) ? value.join(' ') : value
        if (!messageValue?.trim()) return 'Message content is required'
        if (messageValue.trim().length < 10) return 'Message must be at least 10 characters'
        if (messageValue.length > 160) return 'Message exceeds 160 character limit'

        // Check for required opt-out language
        const hasOptOut = /(reply\s+stop|unsubscribe|opt\s*out)/i.test(messageValue)
        if (!hasOptOut) {
          return 'Message must include opt-out language (e.g., "Reply STOP to opt-out")'
        }
        return null

      case 'scheduledDate':
        if (formData.sendTiming === 'scheduled' && !value) {
          return 'Date is required when scheduling'
        }
        if (value) {
          const dateValue = Array.isArray(value) ? value[0] : value
          const selectedDate = new Date(dateValue)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          if (selectedDate < today) {
            return 'Date cannot be in the past'
          }
        }
        return null

      case 'scheduledTime':
        if (formData.sendTiming === 'scheduled' && !value) {
          return 'Time is required when scheduling'
        }
        return null

      case 'selectedStates':
        if (formData.recipients === 'filtered' && (!value || value.length === 0)) {
          return 'Please select at least one state'
        }
        return null

      case 'recipients':
        if (!value) return 'Please select recipients'
        return null

      case 'sendTiming':
        if (!value) return 'Please select send timing'
        return null

      default:
        return null
    }
  }, [formData.sendTiming, formData.recipients])

  const validateAllFields = useCallback(() => {
    const errors: Record<string, string> = {}

    // Validate all fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData])
      if (error) {
        errors[key] = error
      }
    })

    // Additional validation for selected states when filtered
    if (formData.recipients === 'filtered') {
      const stateError = validateField('selectedStates', formData.selectedStates)
      if (stateError) {
        errors.selectedStates = stateError
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData, validateField])

  const updateFieldError = useCallback((fieldName: string, value: string | string[] | undefined) => {
    const error = validateField(fieldName, value)
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }))
  }, [validateField])

  const markFieldTouched = useCallback((fieldName: string) => {
    setFieldTouched(prev => ({
      ...prev,
      [fieldName]: true
    }))
  }, [])

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    setIsAutoSaving(true)
    try {
      // Mock auto-save API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setLastSaved(new Date())
      console.log('Campaign auto-saved:', formData)
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }, [formData])

  // Debounced auto-save
  React.useEffect(() => {
    if (!formData.name && !formData.messageBody) return

    const timer = setTimeout(() => {
      if (formData.name.trim() || formData.messageBody.trim()) {
        autoSave()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [formData, autoSave])

  const handleMessageChange = (value: string) => {
    setFormData(prev => ({ ...prev, messageBody: value }))
    updateFieldError('messageBody', value)
  }

  // Context7-compliant textarea ref for direct DOM manipulation
  const messageBodyRef = React.useRef<HTMLTextAreaElement>(null)

  const insertVariable = (variable: string) => {
    const textarea = messageBodyRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = formData.messageBody.substring(0, start) + variable + formData.messageBody.substring(end)
      setFormData(prev => ({ ...prev, messageBody: newValue }))

      // Set cursor position after insertion using React ref pattern
      setTimeout(() => {
        if (messageBodyRef.current) {
          messageBodyRef.current.focus()
          messageBodyRef.current.setSelectionRange(start + variable.length, start + variable.length)
        }
      }, 0)
    }
  }

  const handleShortLinkInsert = () => {
    if (generatedShortLink) {
      insertVariable(generatedShortLink)
      setShowShortLinkModal(false)
      setGeneratedShortLink("")
    }
  }

  const handleTemplateSelect = (template: CampaignTemplateUI) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      messageBody: template.messageBody
    }))
    setShowTemplateSelector(false)
  }

  const handleSaveAsTemplate = async () => {
    if (!templateFormData.name.trim() || !formData.messageBody.trim()) return

    setIsSavingTemplate(true)
    try {
      await createTemplate({
        name: templateFormData.name,
        messageBody: formData.messageBody,
        category: templateFormData.category,
        isDefault: templateFormData.isPublic,
      })

      setShowSaveTemplateModal(false)
      setTemplateFormData({
        name: "",
        description: "",
        category: "general",
        isPublic: false,
      })

      // Show success notification (you could add a toast here)
      console.log("Template saved successfully!")
    } catch (error) {
      console.error("Failed to save template:", error)
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const generateShortLink = async () => {
    if (!shortLinkUrl) return

    setIsGeneratingLink(true)
    try {
      // Mock short link generation with delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockShortLink = `https://bit.ly/${Math.random().toString(36).substring(2, 8)}`
      setGeneratedShortLink(mockShortLink)
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const getSelectedContactCount = () => {
    if (formData.recipients === "all") {
      return totalContacts
    } else if (formData.recipients === "filtered" && formData.selectedStates.length > 0) {
      return formData.selectedStates.reduce((total, state) => total + (stateCounts[state as keyof typeof stateCounts] || 0), 0)
    }
    return 0
  }

  // Deterministic formatter to avoid SSR/CSR mismatch across locales
  const formatNumber = (value: number) => {
    try {
      return new Intl.NumberFormat('en-US').format(value)
    } catch (e) {
      return String(value)
    }
  }

  const getPreviewMessage = () => {
    let preview = formData.messageBody
      .replace("{firstName}", "John")
      .replace("{lastName}", "Doe")
    return preview || "Your message will appear here..."
  }

  const handleSubmit = async (action: "save" | "send") => {
    // Validate all fields before submission
    const isValid = validateAllFields()
    if (!isValid) {
      // Mark all fields as touched to show errors
      setFieldTouched({
        name: true,
        messageBody: true,
        recipients: true,
        sendTiming: true,
        scheduledDate: formData.sendTiming === 'scheduled',
        scheduledTime: formData.sendTiming === 'scheduled',
        selectedStates: formData.recipients === 'filtered'
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare campaign data
      const campaignData = {
        name: formData.name,
        messageBody: formData.messageBody,
        status: "draft" as const,
        totalRecipients: getSelectedContactCount(),
        // Add scheduled date if applicable
        ...(formData.sendTiming === "scheduled" && formData.scheduledDate && formData.scheduledTime && {
          scheduledAt: new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
        })
      }

      // Create the campaign
      const newCampaign = await createCampaign(campaignData)

      if (action === "send" && newCampaign) {
        // If sending immediately, call the send API
        const response = await fetch(`/api/campaigns/${(newCampaign as any).id}/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scheduledFor: formData.sendTiming === "scheduled" && formData.scheduledDate && formData.scheduledTime
              ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
              : undefined
          }),
        })

        if (response.ok) {
          router.push("/campaigns?status=sent")
        } else {
          throw new Error("Failed to send campaign")
        }
      } else {
        router.push("/campaigns?status=saved")
      }
    } catch (error) {
      console.error("Failed to save campaign:", error)
      // Fallback to mock behavior if API fails
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log("Campaign data (fallback):", {
        ...formData,
        contactCount: getSelectedContactCount(),
        action
      })

      if (action === "send") {
        router.push("/campaigns?status=sent")
      } else {
        router.push("/campaigns?status=saved")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = Object.keys(fieldErrors).every(key => !fieldErrors[key]) &&
                     formData.name.trim() &&
                     formData.messageBody.trim() &&
                     getSelectedContactCount() > 0 &&
                     (formData.sendTiming === "now" || (formData.scheduledDate && formData.scheduledTime))

  return (
    <div className="min-h-screen bg-background">

      {/* Modern Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-xl px-4 py-2"
                size="sm"
              >
                <Link href="/campaigns" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back to Campaigns</span>
                </Link>
              </Button>
              <div className="hidden sm:block h-6 w-px bg-border"></div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Create Campaign</h1>
                <p className="text-sm text-muted-foreground">Design and configure your SMS campaign</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Auto-save indicator */}
              {(isAutoSaving || lastSaved) && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border border-border">
                  {isAutoSaving ? (
                    <>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-foreground">Saving...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-sm font-medium text-foreground">Saved {lastSaved?.toLocaleTimeString()}</span>
                    </>
                  )}
                </div>
              )}

              {/* Secondary Action */}
              <Button
                onClick={() => handleSubmit("save")}
                disabled={!isFormValid || isSubmitting}
                variant="outline"
                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-xl px-5 py-2.5 font-medium"
                size="sm"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? "Saving..." : "Save Draft"}
              </Button>

              {/* Primary Action */}
              <Button
                onClick={() => handleSubmit("send")}
                disabled={!isFormValid || isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-2.5 font-semibold border-0"
                size="sm"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? "Sending..." : "Send Campaign"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-8">

          {/* Campaign Details */}
          <section className="bg-white rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/60">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg">
                  <Save className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Campaign Details</h2>
                  <p className="text-gray-600 mt-1">Give your campaign a name and configure basic settings</p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm font-semibold text-gray-900 mb-3 block">
                  Campaign Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Spring Sale 2025 - Weekend Blast"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                    updateFieldError('name', e.target.value)
                  }}
                  onBlur={() => markFieldTouched('name')}
                  className={`mt-2 h-12 rounded-xl border-2 transition-all duration-200 bg-background ${
                    fieldTouched.name && fieldErrors.name
                      ? 'border-destructive bg-destructive/5 focus:ring-2 focus:ring-destructive/20 focus:border-destructive'
                      : fieldTouched.name && !fieldErrors.name && formData.name.trim()
                      ? 'border-green-600 bg-green-50/50 focus:ring-2 focus:ring-green-500/20 focus:border-green-600'
                      : 'border-input bg-background hover:bg-accent/50 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  }`}
                />
                {fieldTouched.name && fieldErrors.name && (
                  <div className="mt-3 p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                    <p className="text-sm font-medium text-destructive flex items-center gap-2">
                      <span className="w-2 h-2 bg-destructive rounded-full flex-shrink-0"></span>
                      {fieldErrors.name}
                    </p>
                  </div>
                )}
                {fieldTouched.name && !fieldErrors.name && formData.name.trim() && (
                  <p className="text-sm font-medium text-green-600 mt-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></span>
                    Campaign name looks great!
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-3">
                  Choose a descriptive name to help you identify this campaign later
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTemplateSelector(true)}
                  className="border-2 border-secondary/50 text-secondary-foreground bg-secondary/50 hover:bg-secondary hover:border-secondary transition-all duration-200 rounded-xl px-5 py-2.5 font-medium shadow-sm"
                  size="sm"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
                <p className="text-sm text-muted-foreground">
                  Start with a pre-designed message template
                </p>
              </div>
            </div>
          </section>

            {/* Message Composer */}
          <section className="bg-white rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200/60">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Message Composer</h2>
                  <p className="text-gray-600 mt-1">Craft your SMS message with personalization</p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-6">
            <div>
                <Label htmlFor="message-body" className="text-sm font-semibold text-gray-900 mb-3 block">
                  Message Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  ref={messageBodyRef}
                  id="message-body"
                  placeholder="Hi {firstName}, get 25% off this weekend! Use code SAVE25. Visit {link} - Reply STOP to opt out."
                  value={formData.messageBody}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  onBlur={() => markFieldTouched('messageBody')}
                  rows={6}
                  className={`mt-2 rounded-xl border-2 transition-all duration-200 resize-none ${
                    fieldTouched.messageBody && fieldErrors.messageBody
                      ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                      : fieldTouched.messageBody && !fieldErrors.messageBody && formData.messageBody.trim()
                      ? 'border-green-300 bg-green-50/50 focus:ring-2 focus:ring-green-500/20 focus:border-green-500'
                      : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500'
                  }`}
                />
                {fieldTouched.messageBody && fieldErrors.messageBody && (
                  <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                      {fieldErrors.messageBody}
                    </p>
                  </div>
                )}
                {fieldTouched.messageBody && !fieldErrors.messageBody && formData.messageBody.trim() && (
                  <p className="text-sm font-medium text-green-700 mt-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                    Message looks great with opt-out language!
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-3">
                  Use variables like <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{'{firstName}'}</code> and <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{'{lastName}'}</code> to personalize your message
                </p>
              </div>

              {/* Character Counter */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className={`text-sm font-bold ${
                      charactersRemaining < 0 ? 'text-red-600' :
                      charactersRemaining < 20 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {charactersRemaining < 0 ? `${Math.abs(charactersRemaining)} characters over limit` :
                       charactersRemaining < 20 ? `${charactersRemaining} characters remaining` :
                       `${charactersRemaining} characters remaining`}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {characterCount} / {characterLimit} characters
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{Math.ceil(characterCount / 160) || 1}</div>
                      <div className="text-xs text-gray-500">Parts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900">${(Math.ceil(characterCount / 160) * 0.05).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Est. Cost</div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 shadow-sm ${
                        characterCount > 160 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                        characterCount > 140 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                        'bg-gradient-to-r from-green-400 to-green-500'
                      }`}
                      style={{ width: `${Math.min((characterCount / 160) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Personalization Tools */}
              <div className="pt-6 border-t border-gray-200/60">
                <div className="text-sm font-bold text-gray-900 mb-4">Personalization Tools</div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable("{firstName}")}
                    className="border-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 rounded-xl px-4 py-2.5 font-medium shadow-sm"
                  >
                    <span className="text-lg mr-2">👤</span>
                    First Name
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable("{lastName}")}
                    className="border-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 rounded-xl px-4 py-2.5 font-medium shadow-sm"
                  >
                    <span className="text-lg mr-2">👥</span>
                    Last Name
                  </Button>
                      <Dialog open={showShortLinkModal} onOpenChange={setShowShortLinkModal}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-2 border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:border-green-300 transition-all duration-200 rounded-xl px-4 py-2.5 font-medium shadow-sm"
                      >
                        <span className="text-lg mr-2">🔗</span>
                        Add Link
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Short Link</DialogTitle>
                        <DialogDescription>
                          Generate a trackable short URL for your campaign
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="url" className="text-sm font-semibold">Full URL *</Label>
                          <Input
                            id="url"
                            type="url"
                            placeholder="https://yourbusiness.com/sale"
                            value={shortLinkUrl}
                            onChange={(e) => setShortLinkUrl(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={generateShortLink}
                            disabled={!shortLinkUrl || isGeneratingLink}
                            className="flex-1 transition-all duration-200"
                          >
                            {isGeneratingLink ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              "Generate Short Link"
                            )}
                          </Button>
                          {generatedShortLink && (
                            <Button
                              variant="outline"
                              onClick={() => navigator.clipboard.writeText(generatedShortLink)}
                            >
                              Copy
                            </Button>
                          )}
                        </div>
                        {generatedShortLink && (
                          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                            <p className="text-sm font-semibold mb-2 text-emerald-800">Generated Link:</p>
                            <p className="text-sm text-emerald-700 break-all font-mono bg-white p-2 rounded border">
                              {generatedShortLink}
                            </p>
                            <Button
                              size="sm"
                              onClick={handleShortLinkInsert}
                              className="w-full mt-3"
                            >
                              Insert to Message
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {formData.messageBody.trim() && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSaveTemplateModal(true)}
                      className="border-2 border-orange-200 text-orange-700 bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 hover:border-orange-300 transition-all duration-200 rounded-xl px-4 py-2.5 font-semibold shadow-sm"
                    >
                      <span className="text-lg mr-2">💾</span>
                      Save Template
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Recipients */}
          <section className="bg-white rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200/60">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recipients</h2>
                  <p className="text-gray-600 mt-1">Select who will receive your campaign</p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-6">
              
          {/* Audience Selection */}
              <div className="space-y-6">
                {fieldTouched.recipients && fieldErrors.recipients && (
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
                    <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                      {fieldErrors.recipients}
                    </p>
                  </div>
                )}

                <RadioGroup
                  value={formData.recipients}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, recipients: value }))
                    updateFieldError('recipients', value)
                    markFieldTouched('recipients')
                  }}
                  className="space-y-4"
                >
                  {/* All Contacts Option */}
                  <div className="group">
                    <div className="flex items-start space-x-4 p-6 border-2 border-gray-200 rounded-2xl hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer has-[:checked]:border-green-500 has-[:checked]:bg-gradient-to-r has-[:checked]:from-green-50 has-[:checked]:to-emerald-50 has-[:checked]:shadow-lg">
                      <RadioGroupItem value="all" id="all" className="mt-2 w-5 h-5 text-green-600 border-2 border-gray-300" />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor="all" className="flex items-start gap-4 cursor-pointer">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 flex items-center justify-center group-hover:from-green-200 group-hover:to-emerald-200 transition-colors">
                            <Users className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-lg text-gray-900 group-hover:text-green-700 transition-colors">All Contacts</p>
                            <p className="text-gray-600 mt-1">Send to your entire contact list</p>
                            <div className="mt-3">
                              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-0 px-3 py-1.5 rounded-lg font-medium">
                                {formatNumber(totalContacts)} recipients
                              </Badge>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Filtered Option */}
                  <div className="group">
                    <div className="flex items-start space-x-4 p-6 border-2 border-gray-200 rounded-2xl hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer has-[:checked]:border-green-500 has-[:checked]:bg-gradient-to-r has-[:checked]:from-green-50 has-[:checked]:to-emerald-50 has-[:checked]:shadow-lg">
                      <RadioGroupItem value="filtered" id="filtered" className="mt-2 w-5 h-5 text-green-600 border-2 border-gray-300" />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor="filtered" className="flex items-start gap-4 cursor-pointer">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                            <Filter className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-lg text-gray-900 group-hover:text-green-700 transition-colors">Filtered by Location</p>
                            <p className="text-gray-600 mt-1">Target specific states or regions</p>
                            <div className="mt-3">
                              <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0 px-3 py-1.5 rounded-lg font-medium">
                                {formatNumber(getSelectedContactCount())} recipients selected
                              </Badge>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

            {/* State Selection */}
              {formData.recipients === "filtered" && (
                <div className="mt-8 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/60 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg">
                      <Filter className="w-5 h-5" />
                    </div>
                    <div>
                      <Label className="text-lg font-bold text-gray-900">Select Target States</Label>
                      <p className="text-gray-600 text-sm mt-1">Choose which states to include in your campaign</p>
                    </div>
                  </div>

                  {fieldTouched.selectedStates && fieldErrors.selectedStates && (
                    <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-200">
                      <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                        {fieldErrors.selectedStates}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    {Object.entries(stateCounts).slice(1).map(([state, count]) => (
                      <div key={state} className="group">
                        <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer">
                          <Checkbox
                            id={state}
                            checked={formData.selectedStates.includes(state)}
                            onCheckedChange={(checked) => {
                              const newStates = checked
                                ? [...formData.selectedStates, state]
                                : formData.selectedStates.filter(s => s !== state)

                              setFormData(prev => ({
                                ...prev,
                                selectedStates: newStates
                              }))

                              updateFieldError('selectedStates', newStates)
                              markFieldTouched('selectedStates')
                            }}
                            className="w-5 h-5 text-blue-600 border-2 border-blue-300 rounded-lg"
                          />
                          <Label htmlFor={state} className="text-sm font-semibold cursor-pointer flex-1 group-hover:text-blue-700 transition-colors">
                            <div>
                              <p className="text-gray-900 font-bold">{state}</p>
                              <p className="text-xs text-gray-500 mt-1">{count} contacts</p>
                            </div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-white/60 rounded-xl border border-blue-200/60">
                    <p className="text-sm font-medium text-blue-800">
                      📍 Selected: <span className="font-bold text-lg">{formatNumber(getSelectedContactCount())}</span> contacts
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

        {/* Send Options */}
          <section className="bg-white rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-200/60">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Send Options</h2>
                  <p className="text-gray-600 mt-1">Choose when to send this campaign</p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-6">
              {/* Timing Selection */}
              {fieldTouched.sendTiming && fieldErrors.sendTiming && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
                  <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                    {fieldErrors.sendTiming}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div
                  className={`group cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                    formData.sendTiming === "now"
                      ? "border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-orange-300 hover:from-orange-50 hover:to-amber-50"
                  }`}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, sendTiming: "now" }))
                    updateFieldError('sendTiming', 'now')
                    markFieldTouched('sendTiming')
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      formData.sendTiming === "now"
                        ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-600"
                    }`}>
                      <Send className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-2 ${
                        formData.sendTiming === "now" ? "text-orange-900" : "text-gray-900 group-hover:text-orange-700"
                      } transition-colors`}>
                        Send Now
                      </h3>
                      <p className="text-gray-600">
                        Launch your campaign immediately
                      </p>
                      <div className="mt-3">
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                          formData.sendTiming === "now"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-700"
                        } transition-colors`}>
                          IMMEDIATE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`group cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                    formData.sendTiming === "scheduled"
                      ? "border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-orange-300 hover:from-orange-50 hover:to-amber-50"
                  }`}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, sendTiming: "scheduled" }))
                    updateFieldError('sendTiming', 'scheduled')
                    markFieldTouched('sendTiming')
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      formData.sendTiming === "scheduled"
                        ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-600"
                    }`}>
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-2 ${
                        formData.sendTiming === "scheduled" ? "text-orange-900" : "text-gray-900 group-hover:text-orange-700"
                      } transition-colors`}>
                        Schedule for Later
                      </h3>
                      <p className="text-gray-600">
                        Set a specific date and time
                      </p>
                      <div className="mt-3">
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                          formData.sendTiming === "scheduled"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-700"
                        } transition-colors`}>
                          SCHEDULED
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date/Time Picker for Scheduled Option */}
              {formData.sendTiming === "scheduled" && (
                <div className="mt-8 p-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200/60 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Schedule Details</h4>
                      <p className="text-gray-600 text-sm mt-1">Set your campaign delivery date and time</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="scheduled-date" className="text-sm font-semibold text-gray-900 mb-3 block">
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="scheduled-date"
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))
                          updateFieldError('scheduledDate', e.target.value)
                        }}
                        onBlur={() => markFieldTouched('scheduledDate')}
                        min={new Date().toISOString().split('T')[0]}
                        className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                          fieldTouched.scheduledDate && fieldErrors.scheduledDate
                            ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                            : fieldTouched.scheduledDate && !fieldErrors.scheduledDate && formData.scheduledDate
                            ? 'border-green-300 bg-green-50/50 focus:ring-2 focus:ring-green-500/20 focus:border-green-500'
                            : 'border-gray-200 bg-white hover:border-orange-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                        }`}
                      />
                      {fieldTouched.scheduledDate && fieldErrors.scheduledDate && (
                        <p className="text-sm font-medium text-red-800 mt-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                          {fieldErrors.scheduledDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="scheduled-time" className="text-sm font-semibold text-gray-900 mb-3 block">
                        Time <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="scheduled-time"
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))
                          updateFieldError('scheduledTime', e.target.value)
                        }}
                        onBlur={() => markFieldTouched('scheduledTime')}
                        className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                          fieldTouched.scheduledTime && fieldErrors.scheduledTime
                            ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                            : fieldTouched.scheduledTime && !fieldErrors.scheduledTime && formData.scheduledTime
                            ? 'border-green-300 bg-green-50/50 focus:ring-2 focus:ring-green-500/20 focus:border-green-500'
                            : 'border-gray-200 bg-white hover:border-orange-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                        }`}
                      />
                      {fieldTouched.scheduledTime && fieldErrors.scheduledTime && (
                        <p className="text-sm font-medium text-red-800 mt-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                          {fieldErrors.scheduledTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {formData.scheduledDate && formData.scheduledTime && (
                    <div className="mt-6 p-4 bg-white rounded-xl border border-orange-200/60 shadow-sm">
                      <p className="text-sm font-medium text-orange-800 flex items-center gap-2">
                        <span className="text-lg">⏰</span>
                        Campaign will be sent on{" "}
                        <span className="font-bold text-orange-900">
                          {new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>{" "}
                        at{" "}
                        <span className="font-bold text-orange-900">
                          {new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* SMS Preview Section */}
      <aside className="border-t border-gray-200/60 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Preview</h2>
            <p className="text-gray-600">See how your campaign will appear and review details</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Live Preview Card */}
            <section className="bg-white rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center shadow-lg">
                    <Filter className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">SMS Preview</h3>
                    <p className="text-sm text-gray-600">Message appearance to recipients</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200/60 shadow-inner">
                  <div className="space-y-4">
                    {/* Sender Info */}
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-200/60">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                        DN
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">DNwerks</p>
                        <p className="text-xs text-gray-500">Marketing SMS</p>
                      </div>
                      <div className="text-xs text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-200">Now</div>
                    </div>

                    {/* Message Content */}
                    <div className="bg-white rounded-xl p-4 border-2 border-gray-200/60 shadow-sm">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 mt-2 flex-shrink-0 shadow-sm"></div>
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed flex-1 text-sm">
                          {getPreviewMessage() || "Start typing your message to see the preview..."}
                        </p>
                      </div>
                    </div>

                    {/* Message Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500 bg-white/60 rounded-lg px-3 py-2 border border-gray-200/60">
                      <span className="font-medium">{characterCount} characters</span>
                      <div className="flex items-center gap-1">
                        <span className="text-green-500">✓</span>
                        <span className="font-medium">Delivered</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Campaign Summary */}
            <section className="bg-white rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-100/50 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-gray-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white flex items-center justify-center shadow-lg">
                    <Save className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Campaign Summary</h3>
                    <p className="text-sm text-gray-600">Review your campaign details</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60">
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Campaign Name</div>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.name || "Untitled Campaign"}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/60">
                  <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Recipients</div>
                  <p className="text-sm font-bold text-gray-900">
                    {formatNumber(getSelectedContactCount())} contacts
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200/60">
                  <div className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-2">Send Timing</div>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.sendTiming === "now" ? "Immediately" :
                     formData.scheduledDate && formData.scheduledTime ?
                     `${new Date(formData.scheduledDate).toLocaleDateString()} at ${formData.scheduledTime}` :
                     "Not specified"}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/60">
                  <div className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">Estimated Cost</div>
                  <p className="text-lg font-bold text-purple-900">
                    ${((getSelectedContactCount() * 0.0079)).toFixed(2)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    (@ $0.0079/SMS)
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </aside>

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* Save as Template Modal */}
      <Dialog open={showSaveTemplateModal} onOpenChange={setShowSaveTemplateModal}>
        <DialogContent className="max-w-lg lg:max-w-xl">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save this message as a reusable template for future campaigns
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g., Welcome Message"
                value={templateFormData.name}
                onChange={(e) => setTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Input
                id="template-description"
                placeholder="Brief description of when to use this template"
                value={templateFormData.description}
                onChange={(e) => setTemplateFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="template-category">Category</Label>
              <Select
                value={templateFormData.category}
                onValueChange={(value) => setTemplateFormData(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="general" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">General</SelectItem>
                  <SelectItem value="marketing" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Marketing</SelectItem>
                  <SelectItem value="reminders" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Reminders</SelectItem>
                  <SelectItem value="alerts" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Alerts</SelectItem>
                  <SelectItem value="announcements" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Announcements</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="template-public"
                checked={templateFormData.isPublic}
                onCheckedChange={(checked) => setTemplateFormData(prev => ({ ...prev, isPublic: !!checked }))}
              />
              <Label htmlFor="template-public" className="text-sm">
                Make this template public (available to all users)
              </Label>
            </div>
            
            <div>
              <Label>Message Preview</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md border text-sm">
                {formData.messageBody}
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setShowSaveTemplateModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAsTemplate}
                disabled={!templateFormData.name.trim() || !formData.messageBody.trim() || isSavingTemplate}
                className="flex-1 transition-all duration-200"
              >
                {isSavingTemplate ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Template"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}