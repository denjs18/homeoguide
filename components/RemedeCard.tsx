import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Remede } from "@/lib/supabase/types"

interface RemedeCardProps {
  remede: Remede
  grade?: number
  showDilutions?: boolean
}

export function RemedeCard({ remede, grade, showDilutions = true }: RemedeCardProps) {
  return (
    <Link href={`/remedes/${remede.id}`}>
      <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary">
                {remede.nom}
              </h3>
              {remede.nom_complet && remede.nom_complet !== remede.nom && (
                <p className="text-sm text-muted-foreground italic">
                  {remede.nom_complet}
                </p>
              )}
            </div>
            {grade && (
              <Badge variant={`grade${grade}` as any} className="shrink-0">
                Grade {grade}
              </Badge>
            )}
          </div>

          {remede.action_principale && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {remede.action_principale}
            </p>
          )}

          {showDilutions && remede.dilutions && remede.dilutions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {remede.dilutions.slice(0, 5).map((dilution) => (
                <span
                  key={dilution}
                  className="text-xs px-2 py-0.5 bg-secondary rounded-full"
                >
                  {dilution}
                </span>
              ))}
              {remede.dilutions.length > 5 && (
                <span className="text-xs px-2 py-0.5 text-muted-foreground">
                  +{remede.dilutions.length - 5}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
