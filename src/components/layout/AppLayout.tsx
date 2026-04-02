import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ToastContainer } from '@/components/ui/Toast'
import { UploadModal } from '@/components/modals/UploadModal'
import { ChangeWalletModal } from '@/components/modals/ChangeWalletModal'
import { OnboardingModal } from '@/components/modals/OnboardingModal'

export function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f1117] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global overlays */}
      <UploadModal type="invoice" />
      <UploadModal type="bill" />
      <ChangeWalletModal />
      <OnboardingModal />
      <ToastContainer />
    </div>
  )
}
