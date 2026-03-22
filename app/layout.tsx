import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/Header"
import { Disclaimer } from "@/components/Disclaimer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HomeoGuide - Repertoire Kent",
  description: "Repertoire homeopathique de Kent complet - 68 000+ rubriques, recherche et repertorisation",
  keywords: ["homeopathie", "Kent", "repertoire", "remedes", "symptomes"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6">
            {children}
          </main>
          <Disclaimer />
        </div>
      </body>
    </html>
  )
}
