---
title: Любимцы
description: Питомцы, что покорили ваше сердце.
---

## Кошки

<SelectPets :petUUIDs="favoriteUUIDs" :petType="'cats'"/>

## Собаки

<SelectPets :petUUIDs="favoriteUUIDs" :petType="'dogs'"/>

<StyleImagePage src="/assets/webp/dogWithCat.webp" width="284" float="center"/>

<script setup>
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'pets_favorites'
const favoriteUUIDs = ref([])

onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    favoriteUUIDs.value = stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Ошибка загрузки избранного:', error)
    favoriteUUIDs.value = []
  }
})
</script>