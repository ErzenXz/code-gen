"use client";
import React, { useEffect, useState } from "react";
import type { FileNode } from "./file-tree";
import { Button } from "@/components/ui/button";
import { Save, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Editor from "@monaco-editor/react";

export default function FileEditor({ file }: Readonly<{ file: FileNode | null }>) {
  const [content, setContent] = useState<string>(file?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });
  const [isDirty, setIsDirty] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "vs-light">("vs-light");

  // Track previous file ID to detect actual file changes
  const prevFileIdRef = React.useRef<string | null>(null);

  // Use a ref to track if the component is mounted
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    // Reset states when file changes
    setContent(file?.content ?? "");
    setStatus({ type: "", message: "" });
    setIsDirty(false);

    // Only set editor to not ready if we have a file and it's a different file
    if (file && prevFileIdRef.current !== file.id) {
      console.log("File changed from", prevFileIdRef.current, "to", file.id);
      setIsEditorReady(false);
      prevFileIdRef.current = file.id;
    }
  }, [file]);

  // Set editor theme based on system/user preference
  // Set up cleanup when component unmounts
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle theme changes
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setEditorTheme(isDarkMode ? 'vs-dark' : 'vs-light');

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkMode = document.documentElement.classList.contains('dark');
          setEditorTheme(isDarkMode ? 'vs-dark' : 'vs-light');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleContentChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      setIsDirty(true);
    }
  };

  const handleEditorDidMount = () => {
    console.log("Editor mounted for file:", file?.name);
    // Set editor ready immediately to avoid delays
    // Only update state if component is still mounted
    if (isMountedRef.current) {
      setIsEditorReady(true);
    }
  };

  async function handleSave() {
    if (!file?.projectId) {
      return;
    }
    setSaving(true);
    setStatus({ type: "", message: "" });
    try {
      const res = await fetch(`/api/project/${file.projectId}/files/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        throw new Error("Failed to save");
      }
      setStatus({ type: "success", message: "File saved successfully!" });
      setIsDirty(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus(prev => prev.type === "success" ? { type: "", message: "" } : prev);
      }, 3000);
    } catch {
      setStatus({ type: "error", message: "Failed to save file" });
    } finally {
      setSaving(false);
    }
  }

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <FileText className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-lg font-medium mb-2">No file selected</p>
        <p className="text-sm">Select a file from the sidebar to edit</p>
      </div>
    );
  }

  // Determine file language for Monaco Editor
  const getLanguage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'c': return 'c';
      case 'cpp': return 'cpp';
      case 'cs': return 'csharp';
      case 'go': return 'go';
      case 'php': return 'php';
      case 'rb': return 'ruby';
      case 'rs': return 'rust';
      case 'swift': return 'swift';
      case 'yml': case 'yaml': return 'yaml';
      case 'sh': case 'bash': return 'shell';
      case 'sql': return 'sql';
      default: return 'plaintext';
    }
  };

  // Get a human-readable language name for display
  const getLanguageDisplay = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'js': return 'JavaScript';
      case 'jsx': return 'React JSX';
      case 'ts': return 'TypeScript';
      case 'tsx': return 'React TSX';
      case 'html': return 'HTML';
      case 'css': return 'CSS';
      case 'json': return 'JSON';
      case 'md': return 'Markdown';
      case 'py': return 'Python';
      case 'java': return 'Java';
      case 'c': return 'C';
      case 'cpp': return 'C++';
      case 'cs': return 'C#';
      case 'go': return 'Go';
      case 'php': return 'PHP';
      case 'rb': return 'Ruby';
      case 'rs': return 'Rust';
      case 'swift': return 'Swift';
      case 'yml': case 'yaml': return 'YAML';
      case 'sh': case 'bash': return 'Shell';
      case 'sql': return 'SQL';
      default: return 'Plain Text';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{getLanguageDisplay(file.name)}</span>
          {file && !isEditorReady && (
            <div className="flex items-center gap-1 text-muted-foreground animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs">Loading editor...</span>
            </div>
          )}
        </div>

        {isDirty && (
          <div className="text-xs text-amber-500 flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded-md">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Unsaved changes</span>
          </div>
        )}
      </div>

      <div className="relative flex-1 min-h-[300px] mb-3 border border-border rounded-lg overflow-hidden">
        {file && !isEditorReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Loading editor...</span>
            </div>
          </div>
        )}
        <Editor
          key={`file-${file.id}`} /* Add key to force remount when file changes */
          height="100%"
          language={getLanguage(file.name)}
          value={content}
          theme={editorTheme}
          onChange={handleContentChange}
          onMount={handleEditorDidMount}
          beforeMount={() => {
            // Ensure loading state is shown before editor mounts
            if (isMountedRef.current) {
              setIsEditorReady(false);
            }
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            automaticLayout: true,
            tabSize: 2,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8
            }
          }}
          loading={(
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          )}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center gap-1.5 h-9 text-sm px-4"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save</span>
              </>
            )}
          </Button>
        </div>

        {status.type && (
          <div className={cn(
            "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md",
            status.type === "success" ? "text-green-500 bg-green-500/10" : "text-destructive bg-destructive/10"
          )}>
            {status.type === "success" ?
              <CheckCircle2 className="h-4 w-4" /> :
              <AlertCircle className="h-4 w-4" />
            }
            <span>{status.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
