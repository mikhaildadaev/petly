---
navbar: false
title: 'Переход по короткой ссылке'
---

<script setup>
import { onMounted } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
onMounted(async () => {
  const url = new URL(window.location.href)
  let shortCode = url.searchParams.get('c')
  if (!shortCode) {
    const path = window.location.pathname
    shortCode = path.replace(/^\/petly\/s\//, '').replace(/\/$/, '')
  }
  if (!shortCode || shortCode.length < 5) {
    window.location.href = '/petly/'
    return
  }
  try {
    const indexResponse = await fetch('/petly/data/index.json')
    const index = await indexResponse.json()
    const langFiles = index.filter(f => f.lang === lang.value)
    const results = await Promise.allSettled(
      langFiles.map(async ({ file, type, subtype }) => {
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
      const currentLang = lang.value || 'ru'
      let redirectUrl = `/petly/${currentLang}/${item._type}/${item._subtype}/${item.uuid}`
      if (item.covenantID) {
        redirectUrl = `/petly/${currentLang}/${item._type}/${item.covenantID}/${item._subtype}/${item.uuid}`
      }
      window.location.href = redirectUrl
    } else {
      window.location.href = '/petly/'
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error)
    window.location.href = '/petly/'
  }
})
</script>

<div style="text-align: center; padding: 4rem 1rem;">
  <h2>⏳ Перенаправление...</h2>
  <p style="color: var(--vp-c-text-2);">Пожалуйста, подождите</p>
</div>