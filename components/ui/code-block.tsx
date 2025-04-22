"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language = "jsx" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-md bg-muted/80 dark:bg-muted/30 my-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 dark:bg-muted/50 border-b">
        <span className="text-xs font-medium text-muted-foreground">{language}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  )
}
