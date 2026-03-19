"use client"

import { cn } from "@/lib/utils"

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

interface AlphabetNavProps {
  activeLetter?: string
  availableLetters?: string[]
  onLetterClick: (letter: string) => void
  orientation?: "horizontal" | "vertical"
}

export function AlphabetNav({
  activeLetter,
  availableLetters = ALPHABET,
  onLetterClick,
  orientation = "vertical"
}: AlphabetNavProps) {
  return (
    <nav
      className={cn(
        "flex gap-0.5",
        orientation === "vertical" ? "flex-col" : "flex-wrap justify-center"
      )}
    >
      {ALPHABET.map((letter) => {
        const isAvailable = availableLetters.includes(letter)
        const isActive = activeLetter === letter

        return (
          <button
            key={letter}
            onClick={() => isAvailable && onLetterClick(letter)}
            disabled={!isAvailable}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors",
              isActive && "bg-primary text-primary-foreground",
              !isActive && isAvailable && "hover:bg-accent hover:text-accent-foreground",
              !isAvailable && "text-muted-foreground/30 cursor-not-allowed"
            )}
          >
            {letter}
          </button>
        )
      })}
    </nav>
  )
}
