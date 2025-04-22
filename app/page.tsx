import ProjectList from "@/components/project-list"

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 p-4 container mx-auto max-w-7xl">
        <ProjectList />
      </main>
    </div>
  )
}
