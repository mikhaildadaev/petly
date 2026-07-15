---
title: Favoriten
description: Tiere, die Ihr Herz erobert haben.
---

# Favoriten ❤️

Сердце — удивительная вещь. Оно не спрашивает, кто ты, где ты и почему. Оно просто начинает биться быстрее, когда видит те самые глаза, ту самую улыбку, тот самый взгляд, от которого становится тепло.

Данный раздел - ваш личный уголок. Здесь живут только те, кто уже успел задеть что-то внутри вас. Те, чьи фотографии вы пересматриваете по несколько раз. Те, кого вы уже мысленно назвали своим.

Вернитесь к ним. Полистайте карточки. Может быть, именно сегодня вы решите: **«Это мой питомец»**.

## Katzen

<SelectPets :petUUIDs="favoriteUUIDs" :petType="'cats'"/>

## Hunde

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