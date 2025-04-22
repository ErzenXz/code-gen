"use client";
import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

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

  useEffect(() => {
    fetch(`/api/project/${projectId}/chat`)
      .then(res => res.json())
      .then(setThreads);
  }, [projectId]);

  useEffect(() => {
    if (activeThread) {
      setActiveThread(threads.find(t => t.id === activeThread.id) || null);
    }
  }, [threads]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread]);

  function selectThread(thread: Thread) {
    setActiveThread(thread);
    setInput("");
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
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
    setLoading(false);
  }

  // --- UI ---
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-2 overflow-x-auto">
        {threads.map(thread => (
          <Button
            key={thread.id}
            variant={activeThread?.id === thread.id ? "default" : "outline"}
            className="rounded-lg text-sm px-3 py-1"
            onClick={() => selectThread(thread)}
          >
            {thread.title}
          </Button>
        ))}
        <Button
          variant="secondary"
          className="rounded-lg text-sm px-3 py-1"
          onClick={() => setActiveThread(null)}
        >
          + New Thread
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto bg-card rounded-lg p-4 border border-border mb-2">
        {activeThread ? (
          <>
            {activeThread.messages.map(msg => (
              <div key={msg.id} className={`mb-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-xl max-w-[75%] ${msg.sender === "user" ? "bg-primary text-white" : "bg-muted text-foreground"}`}>{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="text-muted-foreground italic">Start a new thread to chat with the AI.</div>
        )}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 mt-2">
        <Input
          className="flex-1"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex gap-1 items-center"
        >
          {loading ? "Sending..." : <><Send size={16} /> Send</>}
        </Button>
      </form>
    </div>
  );
}
