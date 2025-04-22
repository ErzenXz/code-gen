"use client"

import type React from "react"

import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import Editor from "@monaco-editor/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Code, Play, Download, Copy, Check, Sparkles, Zap } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Logo } from "@/components/logo"
import { CodeBlock } from "@/components/ui/code-block"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function Chat() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("editor")
  const [copied, setCopied] = useState(false)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) return

    setIsLoading(true)

    // Add user message with unique id
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: prompt }
    const newMessages: ChatMessage[] = [...messages, userMessage]
    setMessages(newMessages)

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      if (!response.ok || !response.body) throw new Error("Failed to generate code")

      // Prepare streaming assistant message with unique id
      const assistantMessage: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "" }
      setMessages([...newMessages, assistantMessage])
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunk = decoder.decode(value)
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: msg.content + chunk } : msg)),
        )
      }
      toast({ title: "Success", description: "Response received!" })

      // Switch to editor tab after generating code
      setActiveTab("editor")
    } catch (error) {
      console.error("Error:", error)

      toast({
        title: "Error",
        description: "Failed to generate code",
        variant: "destructive",
      })
    } finally {
      setPrompt("")
      setIsLoading(false)
    }
  }

  const codeContent = useMemo(() => {
    const assistantMessages = messages.filter((msg) => msg.role === "assistant")
    if (assistantMessages.length === 0) return ""
    const content = assistantMessages[assistantMessages.length - 1].content
    const match = content.match(/```(?:\w*\n)?([\s\S]*)```/)
    return match ? match[1] : content
  }, [messages])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(codeContent)
    setCopied(true)
    toast({ title: "Copied!", description: "Code copied to clipboard" })
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCode = () => {
    const blob = new Blob([codeContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "codeforge-snippet.js"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: "Downloaded!", description: "Code snippet saved" })
  }

  // Function to render message content with code blocks
  const renderMessageContent = (content: string) => {
    const codeBlockRegex = /```([\w]*)\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {content.slice(lastIndex, match.index)}
          </p>,
        )
      }

      // Add code block
      const language = match[1] || "jsx"
      const code = match[2]
      parts.push(<CodeBlock key={`code-${match.index}`} code={code} language={language} />)

      lastIndex = match.index + match[0].length
    }

    // Add remaining text after last code block
    if (lastIndex < content.length) {
      parts.push(
        <p key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {content.slice(lastIndex)}
        </p>,
      )
    }

    return parts.length > 0 ? parts : <p className="whitespace-pre-wrap">{content}</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full w-full">
      {/* Chat Panel */}
      <Card className="flex flex-col h-full border-none shadow-xl bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none" />

        <CardHeader className="border-b px-4 py-3 z-10">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-xs font-normal">
                <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                GPT-4
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 z-10">
          <ScrollArea className="h-[calc(100vh-13rem)]">
            <div className="space-y-6 p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                    <div className="relative bg-background p-6 rounded-full">
                      <Code className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <div className="max-w-md space-y-3">
                    <h3 className="text-2xl font-bold">Welcome to CodeForge</h3>
                    <p className="text-muted-foreground">
                      Describe what you want to build, and I&apos;ll generate the code for you.
                    </p>
                    <div className="pt-4 grid grid-cols-1 gap-2">
                      {[
                        "Create a responsive navbar with dark mode",
                        "Build a pricing section with 3 tiers",
                        "Design a contact form with validation",
                      ].map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          className="justify-start text-left h-auto py-2 px-3 text-sm"
                          onClick={() => setPrompt(suggestion)}
                        >
                          <Sparkles className="h-3 w-3 mr-2 text-primary" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`p-4 rounded-lg max-w-[85%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-card border shadow-sm"
                      }`}
                    >
                      <div className="font-medium text-sm mb-2 flex items-center gap-2">
                        {message.role === "user" ? (
                          "You"
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 text-primary" />
                            <span>CodeForge</span>
                          </>
                        )}
                      </div>
                      <div className="text-sm space-y-2">{renderMessageContent(message.content)}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t p-4 z-10">
          <form onSubmit={handleSubmit} className="w-full flex space-x-2">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to build..."
              disabled={isLoading}
              className="flex-1 bg-background/50 border-muted-foreground/20"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="submit" disabled={isLoading} size="icon" className="bg-primary hover:bg-primary/90">
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </form>
        </CardFooter>
      </Card>

      {/* Editor & Preview */}
      <div className="flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b px-4 flex items-center justify-between">
            <TabsList className="h-10">
              <TabsTrigger value="editor" className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                <span>Editor</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-1">
                <Play className="h-4 w-4" />
                <span>Preview</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={copyToClipboard}
                      disabled={!codeContent}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={downloadCode}
                      disabled={!codeContent}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <TabsContent value="editor" className="flex-1 p-0 m-0 data-[state=active]:flex flex-col">
            <Card className="flex-1 border-none shadow-xl">
              <CardContent className="p-0 h-full">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  value={codeContent}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "var(--font-geist-mono)",
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16 },
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                  }}
                  theme="vs-dark"
                  className="min-h-[calc(100vh-10rem)]"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 p-0 m-0 data-[state=active]:flex flex-col">
            <Card className="flex-1 border-none shadow-xl">
              <CardContent className="p-0 h-full bg-white">
                {codeContent ? (
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="UTF-8" />
                          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                          <script src="https://cdn.tailwindcss.com"></script>
                          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                          <style>
                            body {
                              font-family: 'Inter', system-ui, sans-serif;
                              padding: 1rem;
                            }
                          </style>
                        </head>
                        <body>
                          ${codeContent}
                        </body>
                      </html>
                    `}
                    sandbox="allow-scripts"
                    className="w-full h-full border-none"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                    <Play className="h-10 w-10 text-muted-foreground/50" />
                    <p>Generate code to see the preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
