"use client"

import { useProfile } from "./ProfileProvider"
import { cn } from "@/lib/utils"
import type { SymptomeRemede } from "@/lib/supabase/types"

interface PosologieDisplayProps {
  association: SymptomeRemede
  showAllProfiles?: boolean
}

export function PosologieDisplay({ association, showAllProfiles = false }: PosologieDisplayProps) {
  const { profile, profileInfo } = useProfile()

  const getPosologie = () => {
    switch (profile) {
      case "adulte":
        return association.posologie_adulte
      case "nourrisson":
        return association.posologie_nourrisson
      case "enceinte":
        return association.posologie_enceinte
      case "bovin":
        return association.posologie_bovin
      case "animal":
        return association.posologie_animal
      default:
        return association.posologie_adulte
    }
  }

  const posologie = getPosologie()
  const isAvailableForProfile = association.profils?.includes(profile) ?? true

  if (showAllProfiles) {
    const allPosologies = [
      { label: "Adulte", value: association.posologie_adulte, profile: "adulte" },
      { label: "Nourrisson", value: association.posologie_nourrisson, profile: "nourrisson" },
      { label: "Femme enceinte", value: association.posologie_enceinte, profile: "enceinte" },
      { label: "Bovin", value: association.posologie_bovin, profile: "bovin" },
      { label: "Animal", value: association.posologie_animal, profile: "animal" },
    ].filter(p => p.value)

    if (allPosologies.length === 0) return null

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Posologies par profil</h4>
        <div className="grid gap-2">
          {allPosologies.map(({ label, value, profile: p }) => (
            <div
              key={p}
              className={cn(
                "p-3 rounded-lg text-sm",
                `profile-${p}`
              )}
            >
              <span className="font-medium">{label} :</span> {value}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!isAvailableForProfile) {
    return (
      <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
        Ce remède n&apos;est pas recommandé pour le profil {profileInfo.nom.toLowerCase()}.
      </div>
    )
  }

  if (!posologie) {
    return (
      <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
        Posologie non spécifiée pour ce profil. Consultez un professionnel de santé.
      </div>
    )
  }

  return (
    <div className={cn("p-3 rounded-lg text-sm", `profile-${profile}`)}>
      <div className="flex items-center gap-2 mb-1">
        <span>{profileInfo.icone}</span>
        <span className="font-medium">Posologie {profileInfo.nom}</span>
      </div>
      <p>{posologie}</p>
      {association.dilution_recommandee && (
        <p className="mt-1 text-xs opacity-75">
          Dilution recommandée : {association.dilution_recommandee}
        </p>
      )}
    </div>
  )
}
