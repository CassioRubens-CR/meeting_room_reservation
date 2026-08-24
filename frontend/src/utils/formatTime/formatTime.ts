export function formatTime(value: string) {
  if (!value.includes('T')) {
    return value
  }

  const date = new Date(value)
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`
}
