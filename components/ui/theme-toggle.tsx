"use client"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`relative h-9 w-9 rounded-full border-primary/20 bg-background hover:bg-primary/10 ${className}`}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 text-primary transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 text-primary transition-all duration-300 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mt-1 w-36 rounded-xl p-1">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${theme === 'light' ? 'bg-primary/10 text-primary' : ''}`}
        >
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${theme === 'dark' ? 'bg-primary/10 text-primary' : ''}`}
        >
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${theme === 'system' ? 'bg-primary/10 text-primary' : ''}`}
        >
          <Laptop className="h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
