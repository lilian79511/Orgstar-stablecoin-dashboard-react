import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, GitCompareArrows, Vault,
  ArrowDownCircle, ArrowUpCircle, ShieldCheck,
  FileText, ListChecks, ChevronDown, PanelLeftClose,
} from 'lucide-react'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard',       icon: LayoutDashboard,    key: 'nav.dashboard' },
  { to: '/reconciliation',  icon: GitCompareArrows,   key: 'nav.reconciliation' },
  { to: '/treasury',        icon: Vault,              key: 'nav.treasury' },
]

const comingSoonItems = [
  { to: '/invoices',   icon: ArrowDownCircle, key: 'nav.invoice',   badge: '2', badgeColor: 'bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  { to: '/payments',   icon: ArrowUpCircle,   key: 'nav.payments',  badge: '1', badgeColor: 'bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  { to: '/audit',      icon: ShieldCheck,     key: 'nav.audit' },
  { to: '/tax',        icon: FileText,        key: 'nav.tax',       badge: 'TW', badgeColor: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  { to: '/whitelist',  icon: ListChecks,      key: 'nav.whitelist' },
]

export function Sidebar() {
  const { t } = useTranslation()
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const { profile, role } = useUserStore()
  const [csOpen, setCsOpen] = useState(false)
  useLocation() // keep router context active

  const navBase = 'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors nav-item'
  const navInactive = 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
  const navActive = 'nav-active text-orange-600 dark:text-orange-400'

  return (
    <aside
      className={`
        sidebar-wrap sidebar-bg dark:bg-[#13161e] shrink-0 flex flex-col
        border-r border-gray-100 dark:border-white/5 h-full overflow-y-auto
        ${sidebarCollapsed ? 'w-16 sidebar-collapsed' : 'w-56'}
      `}
    >
      {/* Logo row */}
      <div className="logo-row h-14 flex items-center gap-2.5 px-5 border-b border-gray-100 dark:border-white/5">
        <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
          <span className="text-white font-grotesk font-bold text-xs">O</span>
        </div>
        <span className="sidebar-wordmark font-grotesk font-bold text-base text-gray-900 dark:text-white tracking-tight">
          Orgstar
        </span>
        <button
          onClick={toggleSidebar}
          className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors hidden md:block"
          id="sidebar-collapse-btn"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${navBase} ${isActive ? navActive : navInactive}`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="nav-label">{t(key)}</span>
          </NavLink>
        ))}

        {/* Coming Soon accordion */}
        <button
          onClick={() => setCsOpen((o) => !o)}
          className="nav-section w-full flex items-center justify-between px-3 pt-3 pb-1.5 text-[10px] uppercase tracking-widest text-gray-400/80 dark:text-gray-500/70 font-semibold hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          <span className="nav-label">{t('nav.comingsoon')}</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${csOpen ? 'rotate-180' : ''}`} />
        </button>

        {csOpen && (
          <div className="space-y-0.5">
            {comingSoonItems.map(({ to, icon: Icon, key, badge, badgeColor }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${navBase} ${isActive ? navActive : navInactive}`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="nav-label">{t(key)}</span>
                {badge && (
                  <span className={`nav-badge ml-auto px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${badgeColor}`}>
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* User card */}
      <div className="px-2 pb-3 pt-2 border-t border-gray-100 dark:border-white/5">
        <div className="user-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
          <div className={`w-7 h-7 rounded-full ${role.color} flex items-center justify-center shrink-0`}>
            <span className={`text-[11px] font-bold ${role.textColor}`}>{profile.initials}</span>
          </div>
          <div className="sidebar-user-text text-left min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{profile.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{role.label}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
