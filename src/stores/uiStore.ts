import { create } from 'zustand'

export type ModalName =
  | 'upload-invoice'
  | 'upload-bill'
  | 'create-invoice'
  | 'create-payment'
  | 'pay-confirm'
  | 'add-recipient'
  | 'deposit-withdraw'
  | 'csv-import'
  | 'receipt'
  | 'change-wallet'
  | 'change-invoice'
  | 'change-bill'
  | 'change-tx'
  | 'journal-entry'
  | 'upload-remittance'
  | null

export type DrawerType = 'invoice' | 'recon-tx' | 'approval' | null

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UiStore {
  activeModal: ModalName
  openModal: (name: ModalName) => void
  closeModal: () => void

  drawerType: DrawerType
  drawerItemId: string | null
  openDrawer: (type: DrawerType, itemId: string) => void
  closeDrawer: () => void

  toasts: Toast[]
  showToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void

  sidebarCollapsed: boolean
  toggleSidebar: () => void

  onboardingOpen: boolean
  openOnboarding: () => void
  closeOnboarding: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  activeModal: null,
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),

  drawerType: null,
  drawerItemId: null,
  openDrawer: (type, itemId) => set({ drawerType: type, drawerItemId: itemId }),
  closeDrawer: () => set({ drawerType: null, drawerItemId: null }),

  toasts: [],
  showToast: (message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  onboardingOpen: false,
  openOnboarding: () => set({ onboardingOpen: true }),
  closeOnboarding: () => set({ onboardingOpen: false }),
}))
