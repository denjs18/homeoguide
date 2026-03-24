"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Language = "fr" | "en"

interface LanguageContextType {
  lang: Language
  toggleLang: () => void
  t: (fr: string | null | undefined, en: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "fr",
  toggleLang: () => {},
  t: (fr, en) => fr || en,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("fr")

  useEffect(() => {
    const saved = localStorage.getItem("homeoguide-lang")
    if (saved === "en" || saved === "fr") setLang(saved)
  }, [])

  function toggleLang() {
    const next = lang === "fr" ? "en" : "fr"
    setLang(next)
    localStorage.setItem("homeoguide-lang", next)
  }

  function t(fr: string | null | undefined, en: string): string {
    if (lang === "en") return en
    return fr || en
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
