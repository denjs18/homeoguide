import { cn } from "@/lib/utils"

interface GradeBadgeProps {
  grade: number
  showLabel?: boolean
}

export function GradeBadge({ grade, showLabel }: GradeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-xs font-medium",
        grade === 3 && "bg-red-100 text-red-800 px-1.5 py-0.5",
        grade === 2 && "bg-orange-100 text-orange-800 px-1.5 py-0.5",
        grade === 1 && "bg-gray-100 text-gray-600 px-1.5 py-0.5"
      )}
    >
      {grade}
      {showLabel && (grade === 3 ? " (fort)" : grade === 2 ? " (moyen)" : " (faible)")}
    </span>
  )
}

export function RemedyName({ abbrev, grade }: { abbrev: string; grade: number }) {
  return (
    <span
      className={cn(
        grade === 3 && "font-bold text-red-800",
        grade === 2 && "font-semibold italic",
        grade === 1 && "text-muted-foreground"
      )}
    >
      {abbrev}
    </span>
  )
}
