export function Disclaimer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-4">
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <span className="text-lg">⚠️</span>
          <p>
            <strong>Avertissement :</strong> Les informations fournies sur HomeoGuide sont données à titre indicatif et ne remplacent en aucun cas un avis médical professionnel. Consultez toujours un médecin ou un pharmacien avant de commencer un traitement homéopathique, particulièrement pour les nourrissons, les femmes enceintes et les animaux.
          </p>
        </div>
        <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} HomeoGuide - Guide homéopathique en ligne
        </div>
      </div>
    </footer>
  )
}
