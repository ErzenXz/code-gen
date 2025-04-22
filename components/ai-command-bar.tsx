"use client";
import React, { useState } from "react";

const TOOLS = [
  { id: "create", label: "Create File" },
  { id: "update", label: "Update File" },
  { id: "delete", label: "Delete File" },
  { id: "search", label: "Search File" },
];

export default function AICommandBar({ projectId, onRun }: { projectId: string; onRun: (cmd: { input: string; tool: string }) => void }) {
  const [input, setInput] = useState("");
  const [tool, setTool] = useState(TOOLS[0].id);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    onRun({ input, tool });
    setInput("");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center bg-card border border-border rounded-xl p-4 mt-4 shadow-lg">
      <select
        className="border border-border rounded-lg px-3 py-2 bg-background text-sm font-semibold"
        value={tool}
        onChange={e => setTool(e.target.value)}
        disabled={loading}
      >
        {TOOLS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
      <input
        className="flex-1 border border-border rounded-lg px-4 py-2 bg-background focus:ring-2 focus:ring-primary focus:outline-none"
        placeholder="Type your command or question..."
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-primary/90 transition disabled:opacity-50"
        disabled={loading || !input.trim()}
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
