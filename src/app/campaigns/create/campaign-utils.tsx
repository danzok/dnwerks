"use client"

import { useState } from "react";

export function useCampaignBuilder() {
  const [messageContent, setMessageContent] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = messageContent.substring(0, start) + variable + messageContent.substring(end);
      setMessageContent(newValue);
      
      // Update the textarea value
      textarea.value = newValue;
      
      // Set cursor position after insertion
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const insertTemplate = (type: 'sale' | 'reminder' | 'welcome') => {
    const templates = {
      sale: "Hi {firstName}! 🎉 Special offer just for you - get 25% off your next purchase with code SAVE25. Shop now: {link} Reply STOP to opt out.",
      reminder: "Hi {firstName}, don't forget about your appointment tomorrow at 2 PM. Need to reschedule? Call us or visit {link} Reply STOP to opt out.",
      welcome: "Welcome {firstName}! 👋 Thanks for joining us. Here's your 15% welcome discount: code WELCOME15. Start shopping: {link} Reply STOP to opt out."
    };
    
    const template = templates[type];
    setMessageContent(template);
    
    // Update the textarea
    const textarea = document.getElementById('message-content') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = template;
      textarea.focus();
    }
  };

  return {
    messageContent,
    setMessageContent,
    showLinkDialog,
    setShowLinkDialog,
    insertVariable,
    insertTemplate
  };
}