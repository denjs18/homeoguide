import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/Header"
import { Disclaimer } from "@/components/Disclaimer"
import { ProfileProvider } from "@/components/ProfileProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HomeoGuide - Guide Homéopathique",
  description: "Application de référence homéopathique avec recherche de symptômes et remèdes",
  keywords: ["homéopathie", "remèdes", "symptômes", "santé naturelle", "granules"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ProfileProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6">
              {children}
            </main>
            <Disclaimer />
          </div>
        </ProfileProvider>
      </body>
    </html>
  )
}
