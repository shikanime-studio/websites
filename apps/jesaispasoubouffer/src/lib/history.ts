export interface HistoryEntry {
  id: string
  name: string
  timestamp: number
  latitude: number
  longitude: number
  radius?: number
  query?: string
}

const KEY = 'jspob-history'

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as HistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  }
  catch {
    return []
  }
}

export function addHistory(entry: HistoryEntry) {
  const current = getHistory()
  const next = [entry, ...current].slice(0, 50)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  }
  catch {
    // ignore
  }
}

export function getRecentIds(limit = 10): string[] {
  return getHistory()
    .slice(0, limit)
    .map(e => e.id)
}
