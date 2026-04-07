import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, GitCompareArrows, Vault,
  ArrowDownCircle, ShieldCheck,
  FileText, ListChecks, ChevronDown, PanelLeftClose,
  CheckCircle2, Users, Settings as SettingsIcon,
} from 'lucide-react'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore, type RoleKey } from '@/stores/userStore'
import { useState } from 'react'

const DEMO_PERSONAS = [
  { id: 'finance'  as RoleKey, name: '陳琳達', role: 'Finance Specialist',     badge: 'Full Access',   badgeCls: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400',  color: 'bg-orange-500',  initials: 'LC' },
  { id: 'manager'  as RoleKey, name: '王大明', role: 'Department Manager',      badge: 'Approver',      badgeCls: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',          color: 'bg-blue-500',    initials: 'WM' },
  { id: 'cfo'      as RoleKey, name: '李財長', role: 'Chief Financial Officer', badge: 'Dual Approver', badgeCls: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400',  color: 'bg-violet-500',  initials: 'LC' },
  { id: 'auditor'  as RoleKey, name: '張稽核', role: 'Auditor',                 badge: 'Read-only',     badgeCls: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400',              color: 'bg-emerald-500', initials: 'ZJ' },
]

const navItems = [
  { to: '/dashboard',       icon: LayoutDashboard,    key: 'nav.dashboard' },
  { to: '/approvals',       icon: CheckCircle2,       key: 'nav.approvals',      badge: '2', badgeColor: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  { to: '/reconciliation',  icon: GitCompareArrows,   key: 'nav.reconciliation' },
  { to: '/treasury',        icon: Vault,              key: 'nav.treasury' },
  { to: '/settings',        icon: SettingsIcon,       key: 'nav.settings' },
]

const comingSoonItems = [
  { to: '/invoices',   icon: ArrowDownCircle, key: 'nav.invoice',   badge: '2', badgeColor: 'bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  { to: '/audit',      icon: ShieldCheck,     key: 'nav.audit' },
  { to: '/tax',        icon: FileText,        key: 'nav.tax',       badge: 'TW', badgeColor: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  { to: '/whitelist',  icon: ListChecks,      key: 'nav.whitelist' },
]

export function Sidebar() {
  const { t } = useTranslation()
  const { sidebarCollapsed, toggleSidebar, showToast } = useUiStore()
  const { profile, role, setProfile } = useUserStore()
  const [csOpen, setCsOpen] = useState(false)
  const [switchRoleOpen, setSwitchRoleOpen] = useState(false)
  useLocation() // keep router context active

  function handleSwitchPersona(persona: typeof DEMO_PERSONAS[number]) {
    setProfile({
      name: persona.name,
      roleKey: persona.id,
      company: profile.company,
      initials: persona.initials,
      avatarColor: persona.color,
    })
    showToast(`Switched to ${persona.name} (${persona.role})`, 'success')
    setSwitchRoleOpen(false)
  }

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
        {navItems.map(({ to, icon: Icon, key, badge, badgeColor }: { to: string; icon: React.ElementType; key: string; badge?: string; badgeColor?: string }) => (
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
      <div className="px-2 pb-3 pt-2 border-t border-gray-100 dark:border-white/5 relative">
        {/* Switch Role panel */}
        {switchRoleOpen && !sidebarCollapsed && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-white dark:bg-[#1a1d27] rounded-xl border border-gray-100 dark:border-white/[0.08] shadow-lg p-3 z-50">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Switch Role — Demo</p>
            <div className="space-y-1.5">
              {DEMO_PERSONAS.map((persona) => {
                const isActive = profile.roleKey === persona.id
                return (
                  <button
                    key={persona.id}
                    onClick={() => handleSwitchPersona(persona)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04] ${isActive ? 'ring-1 ring-orange-400 dark:ring-orange-500/60 bg-orange-50/50 dark:bg-orange-500/[0.06]' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-full ${persona.color} flex items-center justify-center shrink-0 ${isActive ? 'ring-2 ring-orange-400 ring-offset-1 dark:ring-offset-[#1a1d27]' : ''}`}>
                      <span className="text-[11px] font-bold text-white">{persona.initials}</span>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{persona.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{persona.role}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${persona.badgeCls}`}>{persona.badge}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2.5">For demo purposes only</p>
          </div>
        )}

        {/* Switch Role button */}
        {!sidebarCollapsed && (
          <button
            onClick={() => setSwitchRoleOpen((o) => !o)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors mb-1"
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            Switch Role
          </button>
        )}

        <div className="user-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
          <div className={`w-7 h-7 rounded-full ${profile.avatarColor ?? role.color} flex items-center justify-center shrink-0`}>
            <span className={`text-[11px] font-bold ${profile.avatarColor ? 'text-white' : role.textColor}`}>{profile.initials}</span>
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
