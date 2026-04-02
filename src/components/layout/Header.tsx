import { Bell, Sun, Moon, PlayCircle, TrendingUp, Menu } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useLangStore } from '@/stores/langStore'
import { useUserStore } from '@/stores/userStore'
import { useUiStore } from '@/stores/uiStore'

export function Header() {
  const { theme, toggleTheme } = useThemeStore()
  const { lang, setLang } = useLangStore()
  const { profile } = useUserStore()
  const { openOnboarding, toggleSidebar, showToast } = useUiStore()

  return (
    <header className="h-14 shrink-0 bg-white dark:bg-[#13161e] border-b border-gray-100 dark:border-white/5 flex items-center px-4 md:px-6 gap-3 md:gap-4 sticky top-0 z-[400]">
      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 transition-colors text-gray-500 dark:text-gray-400 md:hidden"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Page / company title */}
      <h1 className="font-grotesk font-semibold text-base text-gray-900 dark:text-white flex-1 truncate">
        {profile.company}
      </h1>

      {/* Onboarding preview trigger */}
      <button
        onClick={openOnboarding}
        title="Preview onboarding"
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors text-orange-400 hover:text-orange-500"
      >
        <PlayCircle className="w-4 h-4" />
      </button>

      {/* Bell */}
      <button
        onClick={() => showToast('No new notifications', 'info')}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
      >
        <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
      </button>

      {/* Language switcher */}
      <div className="flex items-center gap-0 bg-gray-100 dark:bg-white/8 rounded-lg p-0.5">
        <button
          onClick={() => setLang('en')}
          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
            lang === 'en' ? 'bg-orange-500 text-white' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLang('zh')}
          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
            lang === 'zh' ? 'bg-orange-500 text-white' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          繁中
        </button>
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
      >
        {theme === 'dark' ? (
          <Moon className="w-4 h-4 text-gray-400" />
        ) : (
          <Sun className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* FX rate chip */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/8">
        <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
          USD/TWD <strong className="text-gray-900 dark:text-white">31.85</strong>
        </span>
      </div>
    </header>
  )
}
