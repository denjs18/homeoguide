import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/Header"
import { Disclaimer } from "@/components/Disclaimer"
import { LanguageProvider } from "@/lib/language-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HomeoGuide - Répertoire Kent",
  description: "Répertoire homéopathique de Kent complet - 68 000+ rubriques, recherche et répertorisation",
  keywords: ["homéopathie", "Kent", "répertoire", "remèdes", "symptômes"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={`${inter.className} notranslate`}>
        <LanguageProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6">
              {children}
            </main>
            <Disclaimer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}
