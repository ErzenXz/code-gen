"use client";
import React, { useState } from "react";
import FileTree, { FileNode } from "@/components/file-tree";
import FileEditor from "@/components/file-editor";
import ProjectChat from "@/components/project-chat";

interface ChatThread {
  id: string;
  title: string;
  messages: { id: string; content: string; sender: string }[];
}

interface ProjectWorkspaceProps {
  project: {
    id: string;
    name: string;
    folders: unknown[];
    files: unknown[];
    chatThreads: ChatThread[];
  };
}

export default function ProjectWorkspace({ project }: ProjectWorkspaceProps) {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  return (
    <div className="flex flex-col h-[80vh] rounded-2xl border border-border shadow-xl overflow-hidden bg-background">
      <div className="flex flex-1 min-h-0">
        {/* Left: Chat/Threads */}
        <aside className="w-80 min-w-64 bg-gradient-to-b from-primary/5 to-background border-r border-border flex flex-col">
          <div className="p-4 border-b border-border font-bold text-lg text-primary">Chat</div>
          <div className="flex-1 overflow-y-auto flex flex-col">
            <ProjectChat projectId={project.id} />
          </div>
        </aside>
        {/* Middle: Files/Folders */}
        <nav className="w-72 min-w-56 bg-card border-r border-border flex flex-col">
          <div className="p-4 border-b border-border font-bold text-lg text-primary">Files</div>
          <div className="flex-1 overflow-y-auto p-2">
            <FileTree
              projectId={project.id}
              onSelect={setSelectedFile}
              selectedId={selectedFile?.id}
            />
          </div>
        </nav>
        {/* Right: Preview/Editor */}
        <main className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border font-bold text-lg text-primary bg-background/80 backdrop-blur">Preview & Editor</div>
          <div className="flex-1 overflow-auto p-4">
            <FileEditor file={selectedFile} />
          </div>
        </main>
      </div>
      {/* AICommandBar removed: Only one message input, handled by ProjectChat */}
    </div>
  );
}
