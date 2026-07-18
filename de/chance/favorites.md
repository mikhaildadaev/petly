---
title: Favoriten
description: Tiere, die Ihr Herz erobert haben.
---

# Favoriten ❤️

Das Herz ist ein erstaunliches Ding. Es fragt nicht, wer du bist, wo du bist und warum. Es schlägt einfach schneller, wenn es jene Augen sieht, jenes Lächeln, jenen Blick, der einem so warm ums Herz werden lässt.

Dieser Bereich ist deine ganz persönliche Ecke. Hier leben nur diejenigen, die bereits etwas in dir berührt haben. Diejenigen, deren Fotos du immer wieder anschaust. Diejenigen, die du in Gedanken bereits dein Eigen genannt hast.

Komm zurück zu ihnen. Blättere durch die Karten. Vielleicht entscheidest du genau heute: **«Das ist mein Tier.»**

## Katzen

<SelectPets :type="'cats'" :uuids="favoriteUUIDs"/>

## Hunde

<SelectPets :type="'dogs'" :uuids="favoriteUUIDs"/>

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