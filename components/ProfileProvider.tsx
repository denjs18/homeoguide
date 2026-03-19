"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { PROFILES, type ProfileCode } from "@/lib/utils"

interface ProfileContextType {
  profile: ProfileCode
  setProfile: (profile: ProfileCode) => void
  profileInfo: typeof PROFILES[number]
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ProfileCode>("adulte")

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("homeoguide-profile") as ProfileCode
    if (saved && PROFILES.some(p => p.code === saved)) {
      setProfileState(saved)
    }
  }, [])

  const setProfile = (newProfile: ProfileCode) => {
    setProfileState(newProfile)
    localStorage.setItem("homeoguide-profile", newProfile)
  }

  const profileInfo = PROFILES.find(p => p.code === profile) || PROFILES[0]

  return (
    <ProfileContext.Provider value={{ profile, setProfile, profileInfo }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
