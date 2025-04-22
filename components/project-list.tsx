"use client";
import React, { useEffect, useState } from "react";

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
    <div className="max-w-4xl mx-auto my-10">
      <h2 className="text-4xl font-black mb-8 text-primary tracking-tight flex items-center gap-3">
        <svg width="38" height="38" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="8" fill="hsl(var(--primary))"/><path d="M8 17l4-4 4 4M8 7h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Projects
      </h2>
      <form onSubmit={handleCreate} className="mb-10 flex flex-col md:flex-row gap-4 items-start md:items-end bg-gradient-to-br from-primary/10 via-background to-background rounded-2xl p-8 shadow-xl border border-border">
        <div className="flex-1 w-full">
          <label className="block text-base font-semibold mb-1 text-foreground">Project name</label>
          <input
            className="border border-border rounded-xl px-5 py-3 w-full bg-background focus:ring-2 focus:ring-primary focus:outline-none text-lg transition"
            placeholder="AI SaaS Platform"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            maxLength={48}
            required
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-base font-semibold mb-1 text-foreground">Description</label>
          <input
            className="border border-border rounded-xl px-5 py-3 w-full bg-background focus:ring-2 focus:ring-primary focus:outline-none text-lg transition"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            maxLength={120}
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl px-8 py-3 font-bold shadow-lg hover:from-primary/90 hover:to-purple-700 hover:scale-[1.03] active:scale-100 transition-all duration-150 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
      {error && <div className="text-red-600 mb-4 font-semibold">{error}</div>}
      <ul className="grid md:grid-cols-2 gap-8">
        {projects.length === 0 && <li className="col-span-2 text-center text-muted-foreground">No projects found.</li>}
        {projects.map((project) => (
          <li key={project.id} className="rounded-2xl bg-gradient-to-br from-background via-white/70 to-primary/10 border border-border shadow-lg p-7 flex flex-col gap-3 group relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all duration-150"
            onClick={e => {
              // Prevent click if clicking on a button
              if ((e.target as HTMLElement).tagName === 'BUTTON') return;
              handleOpenProject(project.id);
            }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-extrabold group-hover:scale-105 transition-transform duration-150">
                {project.name.slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                {editId === project.id ? (
                  <input
                    className="font-bold text-xl text-foreground bg-background border border-primary rounded-lg px-3 py-1 w-full mb-1"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    maxLength={48}
                    autoFocus
                  />
                ) : (
                  <div className="font-bold text-xl text-foreground group-hover:text-primary transition truncate">{project.name}</div>
                )}
                <div className="text-xs text-muted-foreground">Created {new Date(project.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            {editId === project.id ? (
              <textarea
                className="text-sm text-muted-foreground bg-background border border-primary rounded-lg px-3 py-2 w-full mb-2"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                maxLength={120}
                rows={2}
              />
            ) : (
              project.description && <div className="text-base text-muted-foreground line-clamp-2">{project.description}</div>
            )}
            <div className="flex gap-2 mt-2">
              {editId === project.id ? (
                <>
                  <button
                    className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
                    onClick={() => handleEditSave(project.id)}
                    disabled={loading}
                  >Save</button>
                  <button
                    className="bg-muted text-foreground px-4 py-2 rounded-lg font-semibold hover:bg-muted/70 transition"
                    onClick={() => setEditId(null)}
                    disabled={loading}
                  >Cancel</button>
                </>
              ) : (
                <>
                  <button
                    className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-[1.07] active:scale-100 transition-all duration-150"
                    onClick={() => handleEdit(project.id)}
                    disabled={loading}
                  >Edit</button>
                  <button
                    className="bg-destructive text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-destructive/80 hover:scale-[1.07] active:scale-100 transition-all duration-150"
                    onClick={() => handleDelete(project.id)}
                    disabled={loading || deletingId === project.id}
                  >{deletingId === project.id ? "Deleting..." : "Delete"}</button>
                </>
              )}
            </div>
            {/* Subtle animated highlight */}
            <div className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full bg-primary/10 blur-2xl opacity-70 pointer-events-none animate-pulse-slow" />
          </li>
        ))}
      </ul>
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
