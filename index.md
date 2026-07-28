---
navbar: false
---

<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
  const base = '/petly/'
  const url = new URL(window.location.href)
  const path = window.location.pathname
  const langMatch = path.match(/^\/petly\/([a-z]{2})(?:\/|$)/)
  if (langMatch) {
    return
  }
  const shortCode = url.searchParams.get('s')
  if (shortCode && shortCode.length > 5) {
    try {
      const indexResponse = await fetch('/petly/data/index.json')
      const index = await indexResponse.json()
      const results = await Promise.allSettled(
        index.map(async ({ file, type, subtype }) => {
          const response = await fetch(`/petly/data/${file}`)
          if (!response.ok) throw new Error(`Failed to load ${file}`)
          const data = await response.json()
          return data.map(item => ({ ...item, _type: type, _subtype: subtype }))
        })
      )
      const allItems = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)
      const item = allItems.find(p => p.short === shortCode)
      if (item) {
        const savedLang = localStorage.getItem('vitepress-lang') || 'ru'
        let redirectUrl = `/petly/${savedLang}/${item._type}/${item._subtype}/${item.uuid}`
        if (item.covenantID) {
          redirectUrl = `/petly/${savedLang}/${item._type}/${item.covenantID}/${item._subtype}/${item.uuid}`
        }
        window.location.href = redirectUrl
        return
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error)
    }
  }
  const savedLang = localStorage.getItem('vitepress-lang')
  window.location.href = `${base}${savedLang}/`
})
</script>

<div style="text-align: center; padding: 4rem 1rem;">
  <h2>⏳ Перенаправление...</h2>
  <p style="color: var(--vp-c-text-2);">Пожалуйста, подождите</p>
</div>