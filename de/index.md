---
layout: home
hero:
  title: "IN GUTER WISSENSCHAFT"
  highlight: "- du"
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

## Katzen
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Hunde
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Freiwillige
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Tierheime
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>