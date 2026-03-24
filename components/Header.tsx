"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { lang, toggleLang, t } = useLanguage()

  const navLinks = [
    { href: "/", label: t("Accueil", "Home") },
    { href: "/trouver-remede", label: t("Trouver un remède", "Find a Remedy"), highlight: true },
    { href: "/repertoire", label: t("Répertoire", "Repertory") },
    { href: "/remedes", label: t("Remèdes", "Remedies") },
    { href: "/recherche", label: t("Recherche", "Search") },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🌿</span>
          <span className="font-bold text-xl text-primary">HomeoGuide</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                link.highlight
                  ? "bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:bg-primary/90"
                  : cn(
                      "hover:text-primary",
                      pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                        ? "text-primary"
                        : "text-muted-foreground"
                    )
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={toggleLang}
            className="text-xs font-medium px-2 py-1 rounded border hover:bg-accent transition-colors"
            title={lang === "fr" ? "Switch to English" : "Passer en français"}
          >
            {lang === "fr" ? "EN" : "FR"}
          </button>
        </nav>

        <button
          className="md:hidden p-2 hover:bg-accent rounded-md"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t bg-background p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-md text-sm font-medium",
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={toggleLang}
            className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent"
          >
            {lang === "fr" ? "Switch to English (EN)" : "Passer en français (FR)"}
          </button>
        </nav>
      )}
    </header>
  )
}
