export type Network = 'eth' | 'pol' | 'sol' | 'trx'
export type Currency = 'USDC_ETH' | 'USDT_TRX' | 'USDC_POL' | 'USDC_SOL' | 'NTD' | 'USD'
export type TxDirection = 'received' | 'sent'
export type DocStatus = 'pending' | 'matched' | 'overdue' | 'paid'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface Invoice {
  id: string
  ref: string
  client: string
  amount: number
  currency: Currency
  network: Network
  dueDate: string
  status: DocStatus
  note?: string
  txHash?: string
}

export interface Bill {
  id: string
  ref: string
  vendor: string
  vendorAddress?: string
  amount: number
  currency: Currency
  network: Network
  dueDate: string
  status: DocStatus
  note?: string
  txHash?: string
}

export interface OnChainTx {
  hash: string
  direction: TxDirection
  amount: number
  currency: string
  network: Network
  timestamp: string
  blockNumber: string
  fxRate?: string
  matchedDocId?: string
}

export interface TreasuryPool {
  id: string
  network: Network
  currency: string
  balance: number
  balanceUSD: number
  change24h: number
  walletAddress: string
}

export interface ReconciliationPair {
  id: string
  invoice?: Invoice
  bill?: Bill
  tx?: OnChainTx
  type: 'invoice' | 'bill'
  fxDiff?: number
  status: 'unmatched' | 'matched' | 'discrepancy'
}
