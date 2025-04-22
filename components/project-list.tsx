"use client";
import React, { useEffect, useState } from "react";
import { PlusCircle, Edit3, Trash2, ArrowRight, Sparkles, Calendar } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  function fetchProjects() {
    setLoading(true);
    fetch("/api/project")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch(() => setError("Failed to fetch projects"))
      .finally(() => setLoading(false));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name) {
      setError("Project name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const newProject = await res.json();
      setProjects([newProject, ...projects]);
      setName("");
      setDescription("");
    } catch {
      setError("Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(id: string) {
    setError("");
    setEditId(id);
    const project = projects.find((p) => p.id === id);
    setEditName(project?.name || "");
    setEditDescription(project?.description || "");
  }

  async function handleEditSave(id: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/project/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      if (!res.ok) throw new Error("Failed to update project");
      const updated = await res.json();
      setProjects(projects.map((p) => (p.id === id ? updated : p)));
      setEditId(null);
    } catch {
      setError("Failed to update project");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/project/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      setProjects(projects.filter((p) => p.id !== id));
    } catch {
      setError("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  }

  function handleOpenProject(id: string) {
    window.location.href = `/project/${id}`;
  }

  return (
    <div className="max-w-5xl mx-auto my-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-black text-primary tracking-tight flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          Projects
        </h2>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/15 text-primary px-4 py-2 rounded-full font-medium transition-all duration-200 group"
          >
            <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {isFormVisible && (
        <div className="mb-10 overflow-hidden">
          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border animate-in slide-in-from-top duration-300">
            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary" />
              Create New Project
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Project name</label>
                <input
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background/50 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all duration-200"
                  placeholder="My Awesome Project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  maxLength={48}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description (optional)</label>
                <textarea
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background/50 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all duration-200 min-h-[80px] resize-none"
                  placeholder="Describe your project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  maxLength={120}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/50 transition-colors duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Project"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-card/50">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary/70" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">Create your first project to get started with AI-powered code generation.</p>
          <button
            onClick={() => setIsFormVisible(true)}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Your First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              {/* Card header with gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Project icon and title */}
              <div className="p-5 flex items-start gap-4 relative">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/80 to-blue-500/80 flex items-center justify-center text-white text-xl font-bold shadow-md group-hover:shadow-primary/20 group-hover:scale-105 transition-all duration-300">
                  {project.name.slice(0,2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  {editId === project.id ? (
                    <input
                      className="w-full px-3 py-1.5 rounded-md border border-primary bg-card focus:ring-2 focus:ring-primary/30 focus:outline-none text-foreground font-medium"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      maxLength={48}
                      autoFocus
                    />
                  ) : (
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                      {project.name}
                    </h3>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created {new Date(project.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="px-5 pb-4 flex-1 relative">
                {editId === project.id ? (
                  <textarea
                    className="w-full px-3 py-2 rounded-md border border-primary bg-card focus:ring-2 focus:ring-primary/30 focus:outline-none text-muted-foreground text-sm resize-none"
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    maxLength={120}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                    {project.description || "No description provided"}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 pt-2 border-t border-border/50 flex justify-between items-center relative">
                {editId === project.id ? (
                  <div className="flex gap-2 w-full">
                    <button
                      className="flex-1 bg-primary text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                      onClick={() => handleEditSave(project.id)}
                      disabled={loading}
                    >
                      Save Changes
                    </button>
                    <button
                      className="flex-1 bg-muted text-foreground px-3 py-1.5 rounded-md font-medium text-sm hover:bg-muted/70 transition-colors"
                      onClick={() => setEditId(null)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className="text-primary hover:text-primary/80 transition-colors p-1.5 rounded-md hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(project.id);
                      }}
                      disabled={loading}
                      aria-label="Edit project"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 group-hover:bg-primary group-hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProject(project.id);
                      }}
                    >
                      Open Project
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      className="text-destructive/70 hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                      disabled={loading || deletingId === project.id}
                      aria-label={deletingId === project.id ? "Deleting..." : "Delete project"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes slide-in-from-top {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-in {
          animation-duration: 300ms;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          animation-fill-mode: both;
        }
        .slide-in-from-top {
          animation-name: slide-in-from-top;
        }
      `}</style>
    </div>
  );
}
