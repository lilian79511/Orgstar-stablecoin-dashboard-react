import { create } from 'zustand'

export type RoleKey = 'finance' | 'manager' | 'cfo' | 'auditor'

export interface Role {
  label: string
  color: string        // Tailwind bg class for avatar
  textColor: string    // Tailwind text class for avatar
  dotColor: string     // Tailwind bg class for status dot
  permissions: string[]
}

export const ROLES: Record<RoleKey, Role> = {
  finance: {
    label: 'Finance Specialist',
    color: 'bg-blue-100 dark:bg-blue-500/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    dotColor: 'bg-blue-500',
    permissions: ['upload', 'reconcile', 'view'],
  },
  manager: {
    label: 'Department Manager',
    color: 'bg-violet-100 dark:bg-violet-500/20',
    textColor: 'text-violet-700 dark:text-violet-300',
    dotColor: 'bg-violet-500',
    permissions: ['upload', 'reconcile', 'approve', 'view'],
  },
  cfo: {
    label: 'Chief Financial Officer',
    color: 'bg-orange-100 dark:bg-orange-500/20',
    textColor: 'text-orange-700 dark:text-orange-300',
    dotColor: 'bg-orange-500',
    permissions: ['upload', 'reconcile', 'approve', 'audit', 'view'],
  },
  auditor: {
    label: 'Auditor',
    color: 'bg-emerald-100 dark:bg-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
    permissions: ['audit', 'view'],
  },
}

interface UserProfile {
  name: string
  roleKey: RoleKey
  company: string
  initials: string
  avatarColor?: string
}

interface UserStore {
  profile: UserProfile
  setProfile: (profile: UserProfile) => void
  role: Role
}

const defaultProfile: UserProfile = {
  name: 'Lillian Chen',
  roleKey: 'finance',
  company: 'Nexora Technology Co., Ltd.',
  initials: 'LC',
  avatarColor: undefined,
}

export const useUserStore = create<UserStore>((set) => ({
  profile: defaultProfile,
  role: ROLES[defaultProfile.roleKey],
  setProfile: (profile) => set({ profile, role: ROLES[profile.roleKey] }),
}))
