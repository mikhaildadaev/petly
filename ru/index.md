---
layout: home
home: 
  name: 'В ДОБРОЛОГИЯХ'
  highlight: '- ты'
  cards:
    - icon: 🐱
      title: 'Кошки'
      description: '...'
      link: '/ru/pets/cats'
    - icon: 🐶
      title: 'Собаки'
      description: '...'
      link: '/ru/pets/dogs'
---

<HeroRandom/>

## Кошки
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Собаки
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Волонтеры
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Приюты
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>