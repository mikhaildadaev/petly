<template>
  <Transition name="preloader">
    <div v-if="isLoading" class="preloader is-indeterminate">
      <svg class="loader" viewBox="0 0 50 50">
        <circle class="bg" cx="25" cy="25" r="20" />
        <circle class="progress-ring" cx="25" cy="25" r="20" />
      </svg>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vitepress'
const isLoading = ref(true)
const router = useRouter()
const MIN_SHOW = 900
let shownAt = Date.now()
const hide = () => {
  const wait = Math.max(0, MIN_SHOW - (Date.now() - shownAt))
  setTimeout(() => { isLoading.value = false }, wait)
}
onMounted(() => {
  if (document.readyState === 'complete') hide()
  else window.addEventListener('load', hide, { once: true })

  const origBefore = router.onBeforeRouteChange
  router.onBeforeRouteChange = (to) => {
    isLoading.value = true
    shownAt = Date.now()
    if (origBefore) origBefore(to)
  }
  router.onAfterRouteChange = () => {
    requestAnimationFrame(() => requestAnimationFrame(hide))
  }
})
</script>