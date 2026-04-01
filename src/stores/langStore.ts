import { create } from 'zustand'
import i18n from '@/i18n'

type Lang = 'en' | 'zh'

interface LangStore {
  lang: Lang
  setLang: (lang: Lang) => void
}

const initial = (localStorage.getItem('orgstar_lang') as Lang) || 'zh'

export const useLangStore = create<LangStore>((set) => ({
  lang: initial,
  setLang: (lang) => {
    localStorage.setItem('orgstar_lang', lang)
    i18n.changeLanguage(lang)
    document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en'
    set({ lang })
  },
}))
