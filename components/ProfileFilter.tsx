"use client"

import { cn } from "@/lib/utils"
import { PROFILES } from "@/lib/utils"
import { useProfile } from "./ProfileProvider"

interface ProfileFilterProps {
  compact?: boolean
}

export function ProfileFilter({ compact = false }: ProfileFilterProps) {
  const { profile, setProfile } = useProfile()

  if (compact) {
    return (
      <div className="relative">
        <select
          value={profile}
          onChange={(e) => setProfile(e.target.value as typeof profile)}
          className="appearance-none bg-secondary text-secondary-foreground px-3 py-1.5 pr-8 rounded-full text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors"
        >
          {PROFILES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.icone} {p.nom}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {PROFILES.map((p) => (
        <button
          key={p.code}
          onClick={() => setProfile(p.code)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            profile === p.code
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
          title={p.description}
        >
          <span className="mr-1.5">{p.icone}</span>
          {p.nom}
        </button>
      ))}
    </div>
  )
}
