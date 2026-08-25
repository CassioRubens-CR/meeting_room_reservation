export function toDateInputValue(value: string) {
  if (!value.includes('T')) {
    return value
  }

  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`
}