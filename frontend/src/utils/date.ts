export function timeAgo(dateInput: string | number | Date) {
  const date = new Date(dateInput)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const intervals: [number, string][] = [
    [31536000, 'y'],
    [2592000, 'mo'],
    [604800, 'w'],
    [86400, 'd'],
    [3600, 'h'],
    [60, 'm'],
  ]
  for (const [sec, label] of intervals) {
    const count = Math.floor(seconds / sec)
    if (count >= 1) return `${count}${label} ago`
  }
  return 'just now'
}
