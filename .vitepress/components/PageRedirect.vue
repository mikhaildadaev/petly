<template>
  <div class="redirect">
    <div class="container" :class="statusClass">
      <div class="wrapper">
        <svg class="loader" viewBox="0 0 50 50">
          <circle class="bg" cx="25" cy="25" r="20" />
          <circle class="progress-ring" cx="25" cy="25"  r="20" :style="{ strokeDashoffset: 125.6 - (125.6 * progress) / 100 }" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const progress = ref(0)
const statusClass = ref('')
const redirectUrl = ref('')
const animateToProgress = (target) => {
  return new Promise((resolve) => {
    const start = progress.value
    const diff = target - start
    const duration = 200
    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 2)
      progress.value = Math.round(start + diff * eased)
      if (t < 1) {
        requestAnimationFrame(step)
      } else {
        progress.value = target
        resolve()
      }
    }
    step()
  })
}
const updateStatus = async (cls, progressTarget) => {
  statusClass.value = cls
  await animateToProgress(progressTarget)
}
const performRedirect = async () => {
  const base = '/petly/'
  const url = new URL(window.location.href)
  const path = window.location.pathname
  const langMatch = path.match(/^\/petly\/([a-z]{2})(?:\/|$)/)
  if (langMatch) {
    await updateStatus('status-success', 100)
    const savedLang = localStorage.getItem('vitepress-lang') || 'ru'
    window.location.href = `${base}${savedLang}/`
    return
  }
  const shortCode = url.searchParams.get('s')
  if (shortCode && shortCode.length > 5) {
    try {
      // ⚡ Этап 1: Начало загрузки (сразу 10%)
      await updateStatus('status-loading', 10)
      // ⚡ Этап 2: Загрузка index.json (10% → 40%)
      const indexResponse = await fetch('/petly/data/index.json')
      const index = await indexResponse.json()
      await updateStatus('status-loading', 40)
      // ⚡ Этап 3: Загрузка всех файлов (40% → 70%)
      const results = await Promise.allSettled(
        index.map(async ({ file, type, subtype }) => {
          const response = await fetch(`/petly/data/${file}`)
          if (!response.ok) throw new Error(`Failed to load ${file}`)
          const data = await response.json()
          return data.map(item => ({ ...item, _type: type, _subtype: subtype }))
        })
      )
      await updateStatus('status-loading', 70)
      // ⚡ Этап 4: Поиск питомца (70% → 90%)
      const allItems = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)
      await updateStatus('status-loading', 90)
      // ⚡ Этап 5: Результат (90% → 100%)
      const item = allItems.find(p => p.short === shortCode)
      if (item) {
        const savedLang = localStorage.getItem('vitepress-lang') || 'ru'
        let redirectPath = `/${savedLang}/${item._type}/${item._subtype}/${item.uuid}`
        if (item.covenantID) {
          redirectPath = `/${savedLang}/${item._type}/${item.covenantID}/${item._subtype}/${item.uuid}`
        }
        redirectUrl.value = `${base}${redirectPath}`

        await updateStatus('status-success', 100)
        window.location.href = redirectUrl.value
      } else {
        await updateStatus('status-error', 100)
        const savedLang = localStorage.getItem('vitepress-lang') || 'ru'
        window.location.href = `${base}${savedLang}/`
      }
    } catch (error) {
      await updateStatus('status-error', 100)
      const savedLang = localStorage.getItem('vitepress-lang') || 'ru'
      window.location.href = `${base}${savedLang}/`
    }
  } else {
    await updateStatus('status-loading', 100)
    const savedLang = localStorage.getItem('vitepress-lang') || 'ru'
    window.location.href = `${base}${savedLang}/`
  }
}
onMounted(() => {
  performRedirect()
})
</script>

<style scoped>
.redirect {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg, #fdfaf6);
  z-index: 9999;
}
.redirect .container {
  max-width: 380px;
  width: 90%;
  padding: 48px 32px 40px;
  text-align: center;
  animation: fadeIn 0.3s ease;
}
.redirect .container .wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}
.redirect .container .wrapper .loader {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.redirect .container .wrapper .loader .bg {
  fill: none;
  stroke: var(--vp-c-border, #e0d5c5);
  stroke-width: 3;
}
.redirect .container .wrapper .loader .progress-ring {
  fill: none;
  stroke: var(--vp-c-brand, #e67e22);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 125.6;
  stroke-dashoffset: 125.6;
  transition: stroke-dashoffset 0.3s ease, stroke 0.5s ease;
}
.redirect .container.status-error .wrapper .loader .progress-ring {
  stroke: #f87171;
}
.redirect .container.status-success .wrapper .loader .progress-ring {
  stroke: #4ade80;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>