const LOCALE_DATE_OPTIONS = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
} as const

export function formatDate (ts: number) {
  return (new Date(ts))
    .toLocaleDateString('en-GB', LOCALE_DATE_OPTIONS)
    .split('/')
    .reverse()
    .join('-')
}
