"use client";
import React, { useState, useEffect } from "react";
import FileTree, { FileNode } from "@/components/file-tree";
import FileEditor from "@/components/file-editor";
import ProjectChat from "@/components/project-chat";
import { FileOperations } from "@/components/file-operations";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import {
  ChevronLeft,
  Code,
  FileText,
  FolderTree,
  MessageSquare,
  PanelLeft,
  PanelRight,
  Settings,
  Sparkles
} from "lucide-react";

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

export default function ProjectWorkspace({ project }: Readonly<ProjectWorkspaceProps>) {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [activeTab, setActiveTab] = useState("editor");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false); // Keep chat open by default
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentFolder, setCurrentFolder] = useState<FileNode | null>(null);

  // Check if we're on mobile and handle initial loading
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);
      if (isMobileView) {
        setSidebarCollapsed(true);
        setChatCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Set a minimum loading time to prevent flickering
    const startTime = Date.now();
    const minLoadingTime = 1000; // milliseconds

    // Simulate loading delay with a minimum time
    const timer = setTimeout(() => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime >= minLoadingTime) {
        setIsLoading(false);
      } else {
        const remainingTime = minLoadingTime - elapsedTime;
        setTimeout(() => setIsLoading(false), remainingTime);
      }
    }, 500);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-1.5rem)] rounded-xl border border-border shadow-xl overflow-hidden bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/80 to-blue-500/80 flex items-center justify-center text-white animate-pulse">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">Loading Workspace</h2>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-1rem)] rounded-xl border border-border shadow-xl overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-5 py-3 h-14">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="rounded-full h-9 w-9">
            <a href="/" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
            </a>
          </Button>

          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary/80 to-blue-500/80 flex items-center justify-center text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="font-semibold text-lg truncate max-w-[200px] lg:max-w-md">{project.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle className="h-9 w-9" />
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 relative">
        {/* File Explorer Sidebar */}
        <div
          className={`${sidebarCollapsed ? 'w-0' : 'w-72 min-w-72'} border-r border-border bg-card flex flex-col transition-all duration-300 z-20 ${isMobile && !sidebarCollapsed ? 'absolute left-0 top-0 bottom-0' : ''}`}
        >
          <div className="flex items-center justify-between py-3 px-4 border-b border-border">
            <div className="flex items-center gap-1.5 text-primary font-medium text-sm">
              <FolderTree className="h-4 w-4" />
              <span>
                {currentFolder ? (
                  <span className="flex items-center gap-1">
                    <button
                      className="hover:underline text-xs text-muted-foreground"
                      onClick={() => setCurrentFolder(null)}
                    >
                      Files
                    </button>
                    <span className="text-muted-foreground">/</span>
                    {currentFolder.name}
                  </span>
                ) : (
                  "Files"
                )}
              </span>
            </div>
            <FileOperations
              projectId={project.id}
              currentFolder={currentFolder}
              selectedFile={selectedFile}
              onFileCreated={() => {
                setRefreshTrigger(prev => prev + 1);
              }}
              onFileDeleted={() => {
                setSelectedFile(null);
                setRefreshTrigger(prev => prev + 1);
              }}
              onFileRenamed={() => {
                setRefreshTrigger(prev => prev + 1);
              }}
            />
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              <FileTree
                projectId={project.id}
                onSelect={(file) => {
                  setSelectedFile(file);
                  if (isMobile) {
                    setSidebarCollapsed(true);
                  }
                }}
                selectedId={selectedFile?.id}
                refreshTrigger={refreshTrigger}
                onFolderSelect={setCurrentFolder}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Toggle sidebar button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card border border-border shadow-md z-30 transform translate-x-0"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-border px-4 flex items-center justify-between bg-card/50 backdrop-blur-sm h-11">
              <TabsList className="h-10">
                <TabsTrigger value="editor" className="flex items-center gap-2 text-sm h-9 px-4">
                  <Code className="h-4 w-4" />
                  <span>Editor</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2 lg:hidden text-sm h-9 px-4">
                  <MessageSquare className="h-4 w-4" />
                  <span>AI Chat</span>
                </TabsTrigger>
              </TabsList>

              {selectedFile && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                </div>
              )}
            </div>

            <TabsContent value="editor" className="flex-1 p-0 m-0 data-[state=active]:flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto p-4">
                <Card className="border-none shadow-none h-full">
                  <CardContent className="p-0 h-full">
                    <FileEditor file={selectedFile} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 p-0 m-0 data-[state=active]:flex flex-col overflow-hidden lg:hidden">
              <div className="flex-1 overflow-hidden p-4">
                <Card className="h-full border-none shadow-none">
                  <CardContent className="p-0 h-full">
                    <ProjectChat projectId={project.id} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Panel (desktop only) */}
        <div
          className={`${chatCollapsed ? 'w-0' : 'w-96 min-w-96'} border-l border-border bg-card flex-col transition-all duration-300 hidden lg:flex`}
        >
          <div className="flex items-center justify-between py-3 px-4 border-b border-border">
            <div className="flex items-center gap-1.5 text-primary font-medium text-sm">
              <MessageSquare className="h-4 w-4" />
              <span>AI Assistant</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-4">
            <ProjectChat projectId={project.id} />
          </div>
        </div>

        {/* Toggle chat button (desktop only) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card border border-border shadow-md z-30 transform translate-x-0 hidden lg:flex"
          onClick={() => setChatCollapsed(!chatCollapsed)}
        >
          {chatCollapsed ? <MessageSquare className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
        </Button>
      </div>
      <Toaster />
    </div>
  );
}
