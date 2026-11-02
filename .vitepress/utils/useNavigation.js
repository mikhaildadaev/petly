import { onMounted, onUnmounted } from 'vue'

const STORAGE_KEY = 'petly-history'
export function saveContext(id, type = 'block') {
  if (typeof window === 'undefined' || !id) return
  const currentUrl = window.location.pathname + window.location.search
  const urlWithHash = `${currentUrl}#${id}`
  window.history.replaceState({ id, type, scrollPosition: window.scrollY }, '', urlWithHash)
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ id, type }))
  } catch {}
}
export function getContext() {
  if (typeof window === 'undefined') return null
  if (window.history.state?.id) {
    return window.history.state
  }
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return null
}
export function useRestore(options = {}) {
  const { onRestore } = options
  const restore = () => {
    const ctx = getContext()
    if (!ctx) return
    if (onRestore) {
      onRestore(ctx)
    } else {
      scrollToElement(ctx.id)
    }
  }
  onMounted(() => {
    window.addEventListener('popstate', restore)
  })
  onUnmounted(() => {
    window.removeEventListener('popstate', restore)
  })
  return { restore }
}
export function scrollToElement(id, maxAttempts = 15) {
  if (typeof window === 'undefined' || !id) return
  let attempts = 0
  const tryScroll = () => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else if (attempts < maxAttempts) {
      attempts++
      setTimeout(tryScroll, 200)
    } else {
      console.warn('⚠️ Элемент не найден:', id)
    }
  }
  tryScroll()
}