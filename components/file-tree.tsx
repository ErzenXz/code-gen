"use client";
import React, { useEffect, useState } from "react";
import { ChevronRight, File, Folder, FolderOpen, Loader2, FileQuestion } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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

function getFileIcon(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch(extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <div className="w-4 h-4 text-yellow-400 flex-shrink-0">📄</div>;
    case 'html':
    case 'htm':
      return <div className="w-4 h-4 text-orange-400 flex-shrink-0">📄</div>;
    case 'css':
    case 'scss':
    case 'sass':
      return <div className="w-4 h-4 text-blue-400 flex-shrink-0">📄</div>;
    case 'json':
      return <div className="w-4 h-4 text-green-400 flex-shrink-0">📄</div>;
    case 'md':
      return <div className="w-4 h-4 text-gray-400 flex-shrink-0">📄</div>;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return <div className="w-4 h-4 text-pink-400 flex-shrink-0">📄</div>;
    default:
      return <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
  }
}

interface FileTreeProps {
  projectId: string;
  onSelect: (file: FileNode) => void;
  selectedId?: string;
  refreshTrigger?: number; // A number that changes to trigger a refresh
  onFolderSelect?: (folder: FileNode | null) => void;
}

export default function FileTree({ projectId, onSelect, selectedId, refreshTrigger = 0, onFolderSelect }: Readonly<FileTreeProps>) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // We'll use this to track the current folder for file operations
  // when a folder is clicked

  // Load files and folders
  useEffect(() => {
    // Set a minimum loading time to prevent flickering
    const startTime = Date.now();
    const minLoadingTime = 600; // milliseconds

    setLoading(true);
    setError(""); // Clear any previous errors

    fetch(`/api/project/${projectId}/files`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(({ folders, files }) => {
        const treeData = buildTree(folders, files);
        setTree(treeData);

        // Auto-expand all folders initially
        const folderStates: Record<string, boolean> = {};
        const setFolderStates = (nodes: FileNode[]) => {
          nodes.forEach(node => {
            if (node.type === "folder") {
              folderStates[node.id] = true;
              if (node.children) {
                setFolderStates(node.children);
              }
            }
          });
        };
        setFolderStates(treeData);
        setExpandedFolders(folderStates);

        // Ensure minimum loading time to prevent flickering
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      })
      .catch((err) => {
        setError(err.message ?? "Failed to load files");
        setLoading(false);
      });
  }, [projectId, refreshTrigger]);

  const toggleFolder = (folder: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({
      ...prev,
      [folder.id]: !prev[folder.id]
    }));

    // Set the current folder for file operations
    if (onFolderSelect) {
      onFolderSelect(folder);
    }
  };

  function renderNode(node: FileNode, depth = 0) {
    const paddingLeft = `${depth * 10 + 4}px`;

    if (node.type === "folder") {
      const isExpanded = expandedFolders[node.id];
      return (
        <div key={node.id}>
          <button
            type="button"
            className="flex items-center gap-1.5 py-1 px-2 hover:bg-primary/5 rounded-md cursor-pointer group transition-colors duration-150 w-full text-left"
            style={{ paddingLeft }}
            onClick={(e) => toggleFolder(node, e)}
            aria-expanded={isExpanded}
          >
            <div className="text-primary/70 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
            {isExpanded ?
              <FolderOpen className="h-4 w-4 text-primary/80" /> :
              <Folder className="h-4 w-4 text-primary/80" />
            }
            <span className="text-xs font-medium truncate">{node.name}</span>
          </button>

          {isExpanded && node.children && (
            <div className="ml-2">
              {node.children.length > 0 ?
                node.children.map(child => renderNode(child, depth + 1)) :
                <div className="text-xs text-muted-foreground italic ml-7 py-1 px-2">(empty)</div>
              }
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        type="button"
        key={node.id}
        className={cn(
          "flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer transition-colors duration-150 w-full text-left",
          selectedId === node.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-primary/5"
        )}
        style={{ paddingLeft }}
        onClick={() => onSelect(node)}
      >
        {getFileIcon(node.name)}
        <span className="text-xs truncate">{node.name}</span>
      </button>
    );
  }

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-muted-foreground">
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="relative">
            <Folder className="h-10 w-10 text-primary/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </div>
          <div className="text-sm font-medium">Loading files...</div>
          <div className="text-xs text-muted-foreground max-w-[200px] text-center">
            Retrieving your project files and folders
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-destructive">
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="relative">
            <Folder className="h-10 w-10 text-destructive/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FileQuestion className="h-5 w-5 text-destructive" />
            </div>
          </div>
          <div className="text-sm font-medium">Error loading files</div>
          <div className="text-xs max-w-[200px] text-center">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-muted-foreground">
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="relative">
            <Folder className="h-10 w-10 text-muted-foreground/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <File className="h-5 w-5 text-muted-foreground/60" />
            </div>
          </div>
          <div className="text-sm font-medium">No files or folders</div>
          <div className="text-xs max-w-[200px] text-center">
            Create a new file or folder to get started with your project
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-2">
      <div className="text-sm py-2">
        {tree.map(node => renderNode(node))}
      </div>
    </ScrollArea>
  );
}
