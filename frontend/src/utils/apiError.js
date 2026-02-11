function asMessage(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string')
    if (first) return first
    for (const item of value) {
      const nested = asMessage(item)
      if (nested) return nested
    }
    return ''
  }
  if (typeof value === 'object') {
    for (const [key, nestedValue] of Object.entries(value)) {
      const nested = asMessage(nestedValue)
      if (nested) return `${key}: ${nested}`
    }
  }
  return ''
}

export function extractApiError(err, fallback = 'Xatolik yuz berdi.') {
  const data = err?.response?.data
  const message = asMessage(data)
  if (message) return message

  if (err?.message === 'Network Error') {
    return "Serverga ulanib bo'lmadi. Backend domain va VITE_API_URL ni tekshiring."
  }

  return fallback
}

