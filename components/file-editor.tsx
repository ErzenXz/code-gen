"use client";
import React, { useEffect, useState } from "react";
import type { FileNode } from "./file-tree";

export default function FileEditor({ file }: { file: FileNode | null }) {
  const [content, setContent] = useState<string>(file?.content || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setContent(file?.content || "");
    setStatus("");
  }, [file]);

  if (!file) {
    return <div className="text-muted-foreground italic">Select a file to preview/edit.</div>;
  }

  async function handleSave() {
    if (!file.projectId) return;
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch(`/api/project/${file.projectId}/files/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setStatus("Saved!");
    } catch {
      setStatus("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="font-bold mb-2 text-lg">{file.name}</div>
      <textarea
        className="border border-border rounded-lg p-3 font-mono bg-background flex-1 min-h-[250px] resize-none focus:ring-2 focus:ring-primary focus:outline-none"
        value={content}
        onChange={e => setContent(e.target.value)}
        disabled={saving}
      />
      <div className="flex gap-2 mt-2 items-center">
        <button
          className="bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-primary/90 transition disabled:opacity-50"
          onClick={handleSave}
          disabled={saving}
        >{saving ? "Saving..." : "Save"}</button>
        {status && <span className="text-xs text-muted-foreground">{status}</span>}
      </div>
    </div>
  );
}
