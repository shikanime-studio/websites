export function formatBytes(bytes: number, locale?: string) {
  if (bytes === 0) {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'byte',
      unitDisplay: 'narrow',
    }).format(0)
  }

  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const unitIndex = Math.min(i, units.length - 1)
  const value = bytes / 1024 ** unitIndex

  const formatter = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: units[unitIndex],
    unitDisplay: 'narrow',
    maximumFractionDigits: 1,
  })

  return formatter.format(value)
}
