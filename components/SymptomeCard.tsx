import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Symptome } from "@/lib/supabase/types"

interface SymptomeCardProps {
  symptome: Symptome
  remedesCount?: number
}

export function SymptomeCard({ symptome, remedesCount }: SymptomeCardProps) {
  return (
    <Link href={`/symptomes/${symptome.id}`}>
      <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg">
              {symptome.nom}
            </h3>
            {symptome.categorie && (
              <Badge variant="secondary" className="shrink-0">
                {symptome.categorie}
              </Badge>
            )}
          </div>

          {symptome.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {symptome.description}
            </p>
          )}

          {remedesCount !== undefined && (
            <div className="mt-3 text-sm text-muted-foreground">
              {remedesCount} remède{remedesCount > 1 ? "s" : ""} associé{remedesCount > 1 ? "s" : ""}
            </div>
          )}

          {symptome.mots_cles && symptome.mots_cles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {symptome.mots_cles.slice(0, 3).map((mot) => (
                <span
                  key={mot}
                  className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                >
                  {mot}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
