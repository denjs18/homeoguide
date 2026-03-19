import { SearchBar } from "@/components/SearchBar"
import { ProfileFilter } from "@/components/ProfileFilter"
import { QuickLinks } from "@/components/QuickLinks"

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          HomeoGuide
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Votre guide homéopathique complet
        </p>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto space-y-4">
          <SearchBar />
          <ProfileFilter />
        </div>
      </div>

      {/* Quick Links */}
      <QuickLinks />

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 py-12">
        <FeatureCard
          title="Recherche Complète"
          description="Recherchez par symptôme ou par remède homéopathique"
          icon="search"
        />
        <FeatureCard
          title="Profils Adaptés"
          description="Posologies adaptées pour adultes, nourrissons, femmes enceintes et animaux"
          icon="users"
        />
        <FeatureCard
          title="Navigation Intuitive"
          description="Parcourez les remèdes par ordre alphabétique"
          icon="list"
        />
      </div>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  icon
}: {
  title: string
  description: string
  icon: string
}) {
  const icons: Record<string, React.ReactNode> = {
    search: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    users: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    list: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  }

  return (
    <div className="bg-card rounded-lg border p-6 text-center hover:shadow-lg transition-shadow">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
        {icons[icon]}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
