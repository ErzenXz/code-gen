import { Sparkles } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <div className="relative flex items-center justify-center w-8 h-8 bg-black dark:bg-black rounded-full">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>
      <span className="font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        CodeForge
      </span>
    </div>
  )
}
