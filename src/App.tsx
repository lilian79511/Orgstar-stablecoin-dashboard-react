import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Reconciliation from '@/pages/Reconciliation'
import Treasury from '@/pages/Treasury'
import ComingSoon from '@/pages/ComingSoon'

export default function App() {
  return (
    <BrowserRouter basename="/Orgstar-stablecoin-dashboard-react">
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"      element={<Dashboard />} />
          <Route path="reconciliation" element={<Reconciliation />} />
          <Route path="treasury"       element={<Treasury />} />
          <Route path="invoices"       element={<ComingSoon title="Invoice" />} />
          <Route path="payments"       element={<ComingSoon title="Approve Payments" />} />
          <Route path="audit"          element={<ComingSoon title="Audit Trail" />} />
          <Route path="tax"            element={<ComingSoon title="Tax Filing" />} />
          <Route path="whitelist"      element={<ComingSoon title="Whitelist" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
