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
      <div className="flex flex-col items-center justify-center h-[calc(100vh-1.5rem)] rounded-2xl border border-border/50 shadow-xl overflow-hidden bg-background/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white animate-pulse shadow-lg shadow-violet-500/20">
            <Sparkles className="h-10 w-10" />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-3 text-foreground">Loading Workspace</h2>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-1rem)] rounded-2xl border border-border/50 shadow-xl overflow-hidden bg-background/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-card/50 backdrop-blur-sm px-6 py-3 h-16">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-xl h-10 w-10 hover:bg-violet-500/10 hover:text-violet-500">
            <a href="/" className="text-muted-foreground hover:text-violet-500">
              <ChevronLeft className="h-5 w-5" />
            </a>
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="font-semibold text-lg truncate max-w-[200px] lg:max-w-md">{project.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="h-10 w-10" />
          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground hover:text-violet-500 hover:bg-violet-500/10">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 relative">
        {/* File Explorer Sidebar */}
        <div
          className={`${sidebarCollapsed ? 'w-0' : 'w-80 min-w-80'} border-r border-border/50 bg-card/50 backdrop-blur-sm flex flex-col transition-all duration-300 z-20 ${isMobile && !sidebarCollapsed ? 'absolute left-0 top-0 bottom-0' : ''}`}
        >
          <div className="flex items-center justify-between py-3 px-4 border-b border-border/50">
            <div className="flex items-center gap-2 text-violet-500 font-medium text-sm">
              <FolderTree className="h-4 w-4" />
              <span>
                {currentFolder ? (
                  <span className="flex items-center gap-1">
                    <button
                      className="hover:text-violet-400 text-xs text-muted-foreground"
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
          className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-card/80 border border-border/50 shadow-lg z-30 transform translate-x-0 hover:bg-violet-500/10 hover:text-violet-500 hover:border-violet-500/50"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-border/50 px-4 flex items-center justify-between bg-card/50 backdrop-blur-sm h-12">
              <TabsList className="h-11">
                <TabsTrigger value="editor" className="flex items-center gap-2 text-sm h-9 px-4 data-[state=active]:bg-violet-500 data-[state=active]:text-white">
                  <Code className="h-4 w-4" />
                  <span>Editor</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2 lg:hidden text-sm h-9 px-4 data-[state=active]:bg-violet-500 data-[state=active]:text-white">
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
          className={`${chatCollapsed ? 'w-0' : 'w-[400px] min-w-[400px]'} border-l border-border/50 bg-card/50 backdrop-blur-sm flex-col transition-all duration-300 hidden lg:flex`}
        >
          <div className="flex items-center justify-between py-3 px-4 border-b border-border/50">
            <div className="flex items-center gap-2 text-violet-500 font-medium text-sm">
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
          className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-card/80 border border-border/50 shadow-lg z-30 transform translate-x-0 hidden lg:flex hover:bg-violet-500/10 hover:text-violet-500 hover:border-violet-500/50"
          onClick={() => setChatCollapsed(!chatCollapsed)}
        >
          {chatCollapsed ? <MessageSquare className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
        </Button>
      </div>
      <Toaster />
    </div>
  );
}
