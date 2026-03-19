"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SearchResult {
  type: "remede" | "symptome"
  id: string
  nom: string
  description: string | null
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true)
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
          if (res.ok) {
            const data = await res.json()
            setResults(data.results || [])
            setIsOpen(true)
          }
        } catch (error) {
          console.error("Search error:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  const remedes = results.filter(r => r.type === "remede")
  const symptomes = results.filter(r => r.type === "symptome")

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Rechercher un symptôme ou un remède..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            className="pl-10 pr-4 h-12 text-base rounded-full border-2 focus:border-primary"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-muted-foreground" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg overflow-hidden z-50">
          {remedes.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-muted text-sm font-semibold text-muted-foreground">
                Remèdes
              </div>
              {remedes.slice(0, 5).map((result) => (
                <Link
                  key={result.id}
                  href={`/remedes/${result.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{result.nom}</div>
                  {result.description && (
                    <div className="text-sm text-muted-foreground truncate">
                      {result.description}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}

          {symptomes.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-muted text-sm font-semibold text-muted-foreground">
                Symptômes
              </div>
              {symptomes.slice(0, 5).map((result) => (
                <Link
                  key={result.id}
                  href={`/symptomes/${result.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{result.nom}</div>
                  {result.description && (
                    <div className="text-sm text-muted-foreground truncate">
                      {result.description}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}

          <Link
            href={`/recherche?q=${encodeURIComponent(query)}`}
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 bg-muted/50 text-center text-sm font-medium text-primary hover:bg-muted transition-colors"
          >
            Voir tous les résultats pour &quot;{query}&quot;
          </Link>
        </div>
      )}
    </div>
  )
}
