"use client"

import { useLanguage } from "@/lib/language-context"

export function Disclaimer() {
  const { t } = useLanguage()
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-4">
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <span className="text-lg">⚠️</span>
          <p>
            <strong>{t("Avertissement :", "Disclaimer:")}</strong> {t(
              "Les informations fournies sur HomeoGuide sont données à titre indicatif et ne remplacent en aucun cas un avis médical professionnel. Consultez toujours un médecin ou un pharmacien avant de commencer un traitement homéopathique, particulièrement pour les nourrissons, les femmes enceintes et les animaux.",
              "The information provided on HomeoGuide is for informational purposes only and does not replace professional medical advice. Always consult a doctor or pharmacist before starting homeopathic treatment, especially for infants, pregnant women, and animals."
            )}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} HomeoGuide - {t("Guide homéopathique en ligne", "Online homeopathic guide")}
        </div>
      </div>
    </footer>
  )
}
