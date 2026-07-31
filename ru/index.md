---
layout: home
home: 
  title: 'В ДОБРОЛОГИЯХ'
  highlight: '- ты'
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

<HomeStyle/>

## Кошки
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Собаки
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Волонтеры
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Приюты
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>