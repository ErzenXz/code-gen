import ProjectList from "@/components/project-list"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex flex-col h-screen bg-background">
        <main className="flex-1 p-4 container mx-auto max-w-7xl">
          <ProjectList />
        </main>
      </div>
    </ThemeProvider>
  )
}
