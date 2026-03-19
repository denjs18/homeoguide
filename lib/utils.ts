import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi")
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
}

export function groupByFirstLetter<T extends { nom: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const letter = item.nom.charAt(0).toUpperCase()
    if (!acc[letter]) {
      acc[letter] = []
    }
    acc[letter].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export const PROFILES = [
  { code: "adulte", nom: "Adulte", icone: "👤", description: "Posologie standard pour adulte" },
  { code: "nourrisson", nom: "Nourrisson", icone: "🍼", description: "Adapté aux nourrissons et enfants" },
  { code: "enceinte", nom: "Femme enceinte", icone: "🤰", description: "Sûr pendant la grossesse" },
  { code: "bovin", nom: "Bovin", icone: "🐄", description: "Élevage bovin" },
  { code: "animal", nom: "Animal", icone: "🐾", description: "Animaux de compagnie" },
] as const

export type ProfileCode = typeof PROFILES[number]["code"]

export const CATEGORIES = [
  { nom: "Général", icone: "🌡️", ordre: 1 },
  { nom: "Digestif", icone: "🍽️", ordre: 2 },
  { nom: "Respiratoire", icone: "🫁", ordre: 3 },
  { nom: "Cutané", icone: "🩹", ordre: 4 },
  { nom: "Nerveux", icone: "🧠", ordre: 5 },
  { nom: "Musculaire", icone: "💪", ordre: 6 },
  { nom: "Circulatoire", icone: "❤️", ordre: 7 },
  { nom: "Urinaire", icone: "🚿", ordre: 8 },
  { nom: "Gynécologique", icone: "♀️", ordre: 9 },
  { nom: "ORL", icone: "👂", ordre: 10 },
  { nom: "Ophtalmique", icone: "👁️", ordre: 11 },
  { nom: "Psychique", icone: "🧘", ordre: 12 },
] as const
