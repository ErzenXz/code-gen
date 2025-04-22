"use client";
import React, { useEffect, useState } from "react";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
  projectId?: string;
  folderId?: string;
}

function buildTree(folders: any[], files: any[]): FileNode[] {
  const folderMap: Record<string, FileNode> = {};
  folders.forEach((folder: any) => {
    folderMap[folder.id] = { ...folder, type: "folder", children: [] };
  });
  folders.forEach((folder: any) => {
    if (folder.parentId && folderMap[folder.parentId]) {
      folderMap[folder.parentId].children!.push(folderMap[folder.id]);
    }
  });
  files.forEach((file: any) => {
    if (file.folderId && folderMap[file.folderId]) {
      folderMap[file.folderId].children!.push({ ...file, type: "file", projectId: file.projectId, folderId: file.folderId });
    }
  });
  // Top-level folders
  const roots = folders.filter((f: any) => !f.parentId).map((f: any) => folderMap[f.id]);
  // Top-level files
  const rootFiles = files.filter((f: any) => !f.folderId).map((f: any) => ({ ...f, type: "file", projectId: f.projectId, folderId: f.folderId }));
  return [...roots, ...rootFiles];
}

export default function FileTree({ projectId, onSelect, selectedId }: { projectId: string; onSelect: (file: FileNode) => void; selectedId?: string }) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/project/${projectId}/files`)
      .then(res => res.json())
      .then(({ folders, files }) => setTree(buildTree(folders, files)))
      .catch(() => setError("Failed to load files"))
      .finally(() => setLoading(false));
  }, [projectId]);

  function renderNode(node: FileNode) {
    if (node.type === "folder") {
      return (
        <details key={node.id} open className="ml-2">
          <summary className="cursor-pointer font-bold text-primary/80 hover:underline">📁 {node.name}</summary>
          <div className="ml-4 border-l border-border pl-2">
            {node.children && node.children.length > 0 ? node.children.map(renderNode) : <div className="text-muted-foreground italic">(empty)</div>}
          </div>
        </details>
      );
    }
    return (
      <div
        key={node.id}
        className={`cursor-pointer px-2 py-1 rounded hover:bg-primary/10 transition ${selectedId === node.id ? "bg-primary/10 text-primary" : ""}`}
        onClick={() => onSelect(node)}
      >
        📝 {node.name}
      </div>
    );
  }

  return (
    <div className="text-sm">
      {loading && <div className="text-muted-foreground">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {tree.length === 0 && !loading && <div className="text-muted-foreground italic">No files or folders.</div>}
      {tree.map(renderNode)}
    </div>
  );
}
