"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, MessageSquare, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: string;
  content: string;
}

interface Thread {
  id: string;
  title: string;
  messages: Message[];
}

export default function ProjectChat({ projectId }: { projectId: string }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/project/${projectId}/chat`)
      .then(res => res.json())
      .then(setThreads)
      .catch(err => console.error("Failed to load chat threads", err));
  }, [projectId]);

  useEffect(() => {
    if (activeThread) {
      setActiveThread(threads.find(t => t.id === activeThread.id) || null);
    }
  }, [threads]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread]);

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    };

    textarea.addEventListener('input', adjustHeight);
    return () => textarea.removeEventListener('input', adjustHeight);
  }, []);

  function selectThread(thread: Thread) {
    setActiveThread(thread);
    setInput("");
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch(`/api/project/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, threadId: activeThread?.id }),
      });

      const data = await res.json();
      if (data.threadId) {
        fetch(`/api/project/${projectId}/chat`)
          .then(res => res.json())
          .then(setThreads);
        setActiveThread(null); // force selection refresh
      }

      setInput("");
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setLoading(false);
    }
  }

  // Format code blocks in messages
  const formatMessage = (content: string) => {
    // Simple code block detection
    if (content.includes('```')) {
      const parts = content.split(/(```[\s\S]*?```)/g);
      return parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3);
          return (
            <pre key={i} className="bg-card border border-border rounded-md p-3 my-2 overflow-x-auto text-xs font-mono">
              {code}
            </pre>
          );
        }
        return <span key={i}>{part}</span>;
      });
    }
    return content;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread selector */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-muted-foreground">Conversations</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-lg text-xs bg-violet-500/10 hover:bg-violet-500/20 text-violet-500"
            onClick={() => setActiveThread(null)}
          >
            <Plus className="h-3 w-3 mr-1" />
            New
          </Button>
        </div>

        <ScrollArea className="pb-1">
          <div className="flex gap-2 py-1">
            {threads.length > 0 ? (
              threads.map(thread => (
                <Button
                  key={thread.id}
                  variant={activeThread?.id === thread.id ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-lg text-xs h-7 whitespace-nowrap max-w-[180px] px-3",
                    activeThread?.id === thread.id 
                      ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-violet-500/20" 
                      : "text-muted-foreground hover:text-violet-500 hover:border-violet-500/50"
                  )}
                  onClick={() => selectThread(thread)}
                >
                  <MessageSquare className="h-3 w-3 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{thread.title}</span>
                </Button>
              ))
            ) : (
              <div className="text-xs text-muted-foreground py-1.5 px-1">No conversations yet</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm mb-4">
        <div className="space-y-4 min-h-[150px] p-4">
          {activeThread ? (
            activeThread.messages.length > 0 ? (
              activeThread.messages.map(msg => (
                <div key={msg.id} className={cn(
                  "flex gap-3 max-w-[90%]",
                  msg.sender === "user" ? "ml-auto" : "mr-auto"
                )}>
                  <div className={cn(
                    "flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center",
                    msg.sender === "user" 
                      ? "order-last bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/20" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {msg.sender === "user" ?
                      <User className="h-4 w-4" /> :
                      <Bot className="h-4 w-4" />
                    }
                  </div>

                  <div className={cn(
                    "rounded-xl px-4 py-3 text-sm",
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-tr-none shadow-lg shadow-violet-500/20"
                      : "bg-muted/50 text-foreground rounded-tl-none border border-border/50"
                  )}>
                    {formatMessage(msg.content)}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-3 opacity-20" />
                <p className="text-sm">Thread created. Send a message to start the conversation.</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
              <Bot className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm font-medium mb-2">Start a new thread</p>
              <p className="text-xs max-w-[250px]">Ask questions about your project or request code examples</p>
            </div>
          )}

          {loading && (
            <div className="flex gap-3 max-w-[90%] mr-auto">
              <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted/50 text-foreground rounded-xl rounded-tl-none px-4 py-3 text-sm border border-border/50">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <form onSubmit={handleSend} className="relative mt-1">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={activeThread ? "Type your message..." : "Start a new conversation..."}
            className="w-full border border-border/50 rounded-xl pl-4 pr-14 py-3 bg-card/50 backdrop-blur-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:outline-none text-sm resize-none min-h-[50px] max-h-[120px]"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className="absolute right-2 bottom-2 h-9 w-9 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-200 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-center">
          <span>Press <kbd className="px-1.5 py-0.5 bg-muted/50 rounded-md border border-border/50 mx-1 text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-muted/50 rounded-md border border-border/50 mx-1 text-[10px] font-mono">Shift+Enter</kbd> for new line</span>
        </div>
      </form>
    </div>
  );
}
