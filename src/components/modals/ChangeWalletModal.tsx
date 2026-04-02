import { useState } from 'react'
import { X, Wallet, ChevronDown, CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUiStore } from '@/stores/uiStore'

const NETWORKS = [
  { id: 'eth', label: 'Ethereum', color: 'bg-blue-400' },
  { id: 'pol', label: 'Polygon',  color: 'bg-violet-400' },
  { id: 'sol', label: 'Solana',   color: 'bg-emerald-400' },
  { id: 'trx', label: 'Tron',     color: 'bg-red-400' },
]

const SAVED_WALLETS = [
  { address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'eth', label: 'Primary (ETH)' },
  { address: 'TQnsPzudRLSxS29BrFp6PQRnvAaavDjfM5',        network: 'trx', label: 'Operations (TRX)' },
]

export function ChangeWalletModal() {
  const { activeModal, closeModal, showToast } = useUiStore()
  const isOpen = activeModal === 'change-wallet'

  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState('eth')
  const [showNetworks, setShowNetworks] = useState(false)

  function onClose() {
    closeModal()
    setAddress('')
    setNetwork('eth')
    setShowNetworks(false)
  }

  function handleConnect() {
    const addr = address.trim()
    if (!addr) return
    showToast(`Wallet connected: ${addr.slice(0, 8)}…${addr.slice(-4)}`, 'success')
    onClose()
  }

  function handleSelectSaved(wallet: typeof SAVED_WALLETS[0]) {
    showToast(`Switched to ${wallet.label}`, 'success')
    onClose()
  }

  const selectedNet = NETWORKS.find((n) => n.id === network) ?? NETWORKS[0]

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" labelledby="wallet-modal-title">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <h3 id="wallet-modal-title" className="font-grotesk font-semibold text-sm text-gray-900 dark:text-white">Change Wallet</h3>
        </div>
        <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Saved wallets */}
        {SAVED_WALLETS.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Saved Wallets</p>
            <div className="space-y-2">
              {SAVED_WALLETS.map((w) => {
                const net = NETWORKS.find((n) => n.id === w.network)
                return (
                  <button
                    key={w.address}
                    onClick={() => handleSelectSaved(w)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-white/[0.08] hover:border-orange-300 dark:hover:border-orange-500/40 hover:bg-orange-50/30 dark:hover:bg-orange-500/5 transition-colors text-left"
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${net?.color ?? 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{w.label}</p>
                      <p className="text-[10px] font-mono text-gray-400 truncate">{w.address}</p>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06]" />
          <span className="text-[10px] text-gray-400 font-medium">OR CONNECT NEW</span>
          <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06]" />
        </div>

        {/* Network selector */}
        <div className="relative">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Network</p>
          <button
            onClick={() => setShowNetworks((v) => !v)}
            aria-expanded={showNetworks}
            aria-haspopup="listbox"
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${selectedNet.color}`} />
            <span className="flex-1 text-left">{selectedNet.label}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showNetworks ? 'rotate-180' : ''}`} />
          </button>
          {showNetworks && (
            <div role="listbox" className="absolute z-10 mt-1 w-full bg-white dark:bg-[#1e2130] border border-gray-100 dark:border-white/[0.08] rounded-lg shadow-lg overflow-hidden">
              {NETWORKS.map((n) => (
                <button
                  key={n.id}
                  role="option"
                  aria-selected={n.id === network}
                  onClick={() => { setNetwork(n.id); setShowNetworks(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${n.color}`} />
                  {n.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Address input */}
        <div>
          <label htmlFor="wallet-address" className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Wallet Address</label>
          <input
            id="wallet-address"
            type="text"
            aria-label="Wallet address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x… or TQ…"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500/60 transition-colors font-mono"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-white/[0.06]">
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" disabled={!address.trim()} onClick={handleConnect}>
          <Wallet className="w-3.5 h-3.5" />
          Connect Wallet
        </Button>
      </div>
    </Modal>
  )
}
