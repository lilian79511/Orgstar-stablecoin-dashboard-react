export function formatAmount(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address || address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars)}…${address.slice(-4)}`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export const NET_LABEL: Record<string, string> = {
  eth: 'ETH',
  pol: 'POL',
  sol: 'SOL',
  trx: 'TRX',
}
