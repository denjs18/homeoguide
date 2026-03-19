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

// OOREP chapter categories (French)
export const CATEGORIES = [
  { nom: "Psychisme", icone: "🧠", ordre: 1 },
  { nom: "Vertiges", icone: "💫", ordre: 2 },
  { nom: "Tête", icone: "🗣️", ordre: 3 },
  { nom: "Yeux", icone: "👁️", ordre: 4 },
  { nom: "Vision", icone: "👀", ordre: 5 },
  { nom: "Oreilles", icone: "👂", ordre: 6 },
  { nom: "Audition", icone: "🔊", ordre: 7 },
  { nom: "Nez", icone: "👃", ordre: 8 },
  { nom: "Visage", icone: "😊", ordre: 9 },
  { nom: "Bouche", icone: "👄", ordre: 10 },
  { nom: "Dents", icone: "🦷", ordre: 11 },
  { nom: "Gorge", icone: "🗣️", ordre: 12 },
  { nom: "Gorge externe", icone: "🗣️", ordre: 13 },
  { nom: "Estomac", icone: "🍽️", ordre: 14 },
  { nom: "Abdomen", icone: "🤰", ordre: 15 },
  { nom: "Rectum", icone: "🚽", ordre: 16 },
  { nom: "Selles", icone: "💩", ordre: 17 },
  { nom: "Vessie", icone: "🚿", ordre: 18 },
  { nom: "Reins", icone: "🫘", ordre: 19 },
  { nom: "Prostate", icone: "♂️", ordre: 20 },
  { nom: "Urètre", icone: "🚿", ordre: 21 },
  { nom: "Urine", icone: "💧", ordre: 22 },
  { nom: "Organes génitaux masculins", icone: "♂️", ordre: 23 },
  { nom: "Organes génitaux féminins", icone: "♀️", ordre: 24 },
  { nom: "Larynx et trachée", icone: "🫁", ordre: 25 },
  { nom: "Respiration", icone: "🌬️", ordre: 26 },
  { nom: "Toux", icone: "😷", ordre: 27 },
  { nom: "Expectoration", icone: "🤧", ordre: 28 },
  { nom: "Poitrine", icone: "❤️", ordre: 29 },
  { nom: "Dos", icone: "🔙", ordre: 30 },
  { nom: "Extrémités", icone: "🦵", ordre: 31 },
  { nom: "Sommeil", icone: "😴", ordre: 32 },
  { nom: "Rêves", icone: "💭", ordre: 33 },
  { nom: "Frissons", icone: "🥶", ordre: 34 },
  { nom: "Fièvre", icone: "🌡️", ordre: 35 },
  { nom: "Transpiration", icone: "💦", ordre: 36 },
  { nom: "Peau", icone: "🩹", ordre: 37 },
  { nom: "Généralités", icone: "📋", ordre: 38 },
] as const
