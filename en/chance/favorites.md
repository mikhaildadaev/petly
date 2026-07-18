---
title: Favorites
description: Pets that have won your heart.
---

# Favorites ❤️

The heart is an amazing thing. It doesn't ask who you are, where you are or why. It just starts beating faster when it sees those eyes, that smile, that look that makes you feel so warm inside.

This section is your own personal space. Only those who have already touched something inside you live here. Those whose photos you look through again and again. Those you've already called your own in your mind.

Come back to them. Browse through the cards. Maybe today you'll decide: **«This is my pet.»**

## Cats

<SelectPets :petUUIDs="favoriteUUIDs" :type="'cats'"/>

## Dogs

<SelectPets :petUUIDs="favoriteUUIDs" :type="'dogs'"/>

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