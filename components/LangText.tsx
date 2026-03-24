"use client"

import { useLanguage } from "@/lib/language-context"

/** Display text based on current language. Shows fr in FR mode, en in EN mode. */
export function LangText({ fr, en }: { fr: string | null | undefined; en: string }) {
  const { lang } = useLanguage()
  return <>{lang === "fr" ? (fr || en) : en}</>
}

/** Display primary text + secondary text in the other language */
export function LangTextWithSub({
  fr,
  en,
  subClassName = "text-xs text-muted-foreground",
}: {
  fr: string | null | undefined
  en: string
  subClassName?: string
}) {
  const { lang } = useLanguage()
  const primary = lang === "fr" ? (fr || en) : en
  const secondary = lang === "fr" && fr ? en : lang === "en" && fr ? fr : null
  return (
    <>
      {primary}
      {secondary && <p className={subClassName}>{secondary}</p>}
    </>
  )
}

/** Show chapter name based on language */
export function LangChapter({ nameFr, nameEn, icon }: { nameFr: string; nameEn: string; icon?: string | null }) {
  const { lang } = useLanguage()
  return <>{icon ? `${icon} ` : ""}{lang === "fr" ? nameFr : nameEn}</>
}
