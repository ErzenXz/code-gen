"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  File, 
  Folder, 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  FileCode,
  FileText as FileTextIcon,
  FileJson,
  FileType
} from "lucide-react";
import { FileNode } from "./file-tree";
import { toast } from "@/components/ui/use-toast";

interface FileOperationsProps {
  projectId: string;
  currentFolder?: FileNode | null;
  onFileCreated: () => void;
  onFileDeleted: () => void;
  onFileRenamed: () => void;
  selectedFile?: FileNode | null;
}

export function FileOperations({ 
  projectId, 
  currentFolder, 
  onFileCreated, 
  onFileDeleted, 
  onFileRenamed,
  selectedFile 
}: FileOperationsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [createTab, setCreateTab] = useState("file");
  const [fileName, setFileName] = useState("");
  const [folderName, setFolderName] = useState("");
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileTemplate, setFileTemplate] = useState("empty");

  // File templates
  const templates = {
    empty: "",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  
</body>
</html>`,
    css: `/* Styles for the page */
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 20px;
  color: #333;
}
`,
    js: `// JavaScript code
console.log('Hello, world!');

function init() {
  // Your code here
}

init();
`,
    json: `{
  "name": "project",
  "version": "1.0.0",
  "description": "A sample project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}`,
    md: `# Project Title

## Description
A brief description of your project.

## Features
- Feature 1
- Feature 2
- Feature 3

## Getting Started
Instructions on how to get started with your project.
`
  };

  // Reset form states
  const resetForms = () => {
    setFileName("");
    setFolderName("");
    setNewName("");
    setFileTemplate("empty");
    setIsLoading(false);
  };

  // Handle create file/folder
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const name = createTab === "file" ? fileName : folderName;
      if (!name) {
        toast({
          title: "Error",
          description: `Please enter a ${createTab} name`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Get content based on template if it's a file
      let content = "";
      if (createTab === "file") {
        content = templates[fileTemplate as keyof typeof templates] || "";
      }

      const response = await fetch(`/api/project/${projectId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: createTab,
          name,
          parentId: currentFolder?.id || null,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ${createTab}`);
      }

      toast({
        title: "Success",
        description: `${createTab === "file" ? "File" : "Folder"} created successfully`,
      });

      onFileCreated();
      setIsCreateDialogOpen(false);
      resetForms();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create ${createTab}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle rename file/folder
  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsLoading(true);

    try {
      if (!newName) {
        toast({
          title: "Error",
          description: "Please enter a new name",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const endpoint = selectedFile.type === "file"
        ? `/api/project/${projectId}/files/${selectedFile.id}`
        : `/api/project/${projectId}/folders/${selectedFile.id}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          content: selectedFile.content, // Preserve content for files
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to rename ${selectedFile.type}`);
      }

      toast({
        title: "Success",
        description: `${selectedFile.type === "file" ? "File" : "Folder"} renamed successfully`,
      });

      onFileRenamed();
      setIsRenameDialogOpen(false);
      resetForms();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to rename ${selectedFile?.type}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete file/folder
  const handleDelete = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    try {
      const endpoint = selectedFile.type === "file"
        ? `/api/project/${projectId}/files/${selectedFile.id}`
        : `/api/project/${projectId}/folders/${selectedFile.id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${selectedFile.type}`);
      }

      toast({
        title: "Success",
        description: `${selectedFile.type === "file" ? "File" : "Folder"} deleted successfully`,
      });

      onFileDeleted();
      setIsDeleteDialogOpen(false);
      resetForms();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${selectedFile?.type}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get file extension icon
  const getTemplateIcon = (template: string) => {
    switch (template) {
      case "html":
        return <FileCode className="h-4 w-4 text-orange-400" />;
      case "css":
        return <FileCode className="h-4 w-4 text-blue-400" />;
      case "js":
        return <FileCode className="h-4 w-4 text-yellow-400" />;
      case "json":
        return <FileJson className="h-4 w-4 text-green-400" />;
      case "md":
        return <FileTextIcon className="h-4 w-4 text-gray-400" />;
      default:
        return <FileType className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <>
      {/* Create File/Folder Button */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full"
            onClick={() => {
              resetForms();
              setCreateTab("file");
            }}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New</DialogTitle>
            <DialogDescription>
              Create a new file or folder in {currentFolder ? `"${currentFolder.name}"` : "the project root"}.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={createTab} onValueChange={setCreateTab} className="mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" className="flex items-center gap-1.5">
                <File className="h-3.5 w-3.5" />
                <span>File</span>
              </TabsTrigger>
              <TabsTrigger value="folder" className="flex items-center gap-1.5">
                <Folder className="h-3.5 w-3.5" />
                <span>Folder</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-4">
              <form onSubmit={handleCreate}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fileName">File Name</Label>
                    <Input
                      id="fileName"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="example.js"
                      className="w-full"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="template">Template</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={fileTemplate === "empty" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-16 gap-1 text-xs"
                        onClick={() => setFileTemplate("empty")}
                      >
                        <FileType className="h-5 w-5" />
                        <span>Empty</span>
                      </Button>
                      <Button
                        type="button"
                        variant={fileTemplate === "html" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-16 gap-1 text-xs"
                        onClick={() => setFileTemplate("html")}
                      >
                        {getTemplateIcon("html")}
                        <span>HTML</span>
                      </Button>
                      <Button
                        type="button"
                        variant={fileTemplate === "css" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-16 gap-1 text-xs"
                        onClick={() => setFileTemplate("css")}
                      >
                        {getTemplateIcon("css")}
                        <span>CSS</span>
                      </Button>
                      <Button
                        type="button"
                        variant={fileTemplate === "js" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-16 gap-1 text-xs"
                        onClick={() => setFileTemplate("js")}
                      >
                        {getTemplateIcon("js")}
                        <span>JavaScript</span>
                      </Button>
                      <Button
                        type="button"
                        variant={fileTemplate === "json" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-16 gap-1 text-xs"
                        onClick={() => setFileTemplate("json")}
                      >
                        {getTemplateIcon("json")}
                        <span>JSON</span>
                      </Button>
                      <Button
                        type="button"
                        variant={fileTemplate === "md" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-16 gap-1 text-xs"
                        onClick={() => setFileTemplate("md")}
                      >
                        {getTemplateIcon("md")}
                        <span>Markdown</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create File"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent value="folder" className="mt-4">
              <form onSubmit={handleCreate}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="folderName">Folder Name</Label>
                    <Input
                      id="folderName"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder="my-folder"
                      className="w-full"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Folder"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* File/Folder Actions Dropdown */}
      {selectedFile && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full absolute right-2 top-2">
              <MoreVertical className="h-3.5 w-3.5" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                setNewName(selectedFile.name);
                setIsRenameDialogOpen(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename {selectedFile?.type}</DialogTitle>
            <DialogDescription>
              Enter a new name for "{selectedFile?.name}".
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRename}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="newName">New Name</Label>
                <Input
                  id="newName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={selectedFile?.name}
                  className="w-full"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRenameDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Renaming..." : "Rename"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete {selectedFile?.type}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedFile?.name}"?
              {selectedFile?.type === "folder" && (
                <span className="text-destructive font-medium block mt-2">
                  This will also delete all files and folders inside it.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
