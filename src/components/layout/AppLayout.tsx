import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ToastContainer } from '@/components/ui/Toast'
import { useUiStore } from '@/stores/uiStore'

export function AppLayout() {
  useUiStore()

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
      <ToastContainer />
    </div>
  )
}
