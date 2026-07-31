---
layout: home
hero:
  title: "IN GOODOLOGY"
  highlight: "- you"
  cards:
    - icon: 🐱
      title: 'Кошки'
      description: 'Найди своего пушистого друга'
      link: '/ru/pets/cats'
    - icon: 🐶
      title: 'Собаки'
      description: 'Верный друг ждёт тебя'
      link: '/ru/pets/dogs'
---

## Cats
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Dogs
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Volunteers
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Shelters
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>