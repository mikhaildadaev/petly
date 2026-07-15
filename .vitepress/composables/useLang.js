import { ref, onMounted, onUnmounted } from 'vue'

const LANG_KEY = 'vitepress-lang'
const lang = ref('ru')

export function useLang() {
  let storageListener = null

  const updateLang = () => {
    try {
      const stored = localStorage.getItem(LANG_KEY)
      lang.value = stored || 'ru'
    } catch {
      lang.value = 'ru'
    }
  }

  onMounted(() => {
    updateLang()
    
    storageListener = (e) => {
      if (e.key === LANG_KEY) {
        lang.value = e.newValue || 'ru'
      }
    }
    window.addEventListener('storage', storageListener)
  })

  onUnmounted(() => {
    if (storageListener) {
      window.removeEventListener('storage', storageListener)
    }
  })

  return { lang, updateLang }
}