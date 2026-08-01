---
layout: home
home: 
  name: 'В ДОБРОЛОГИЯХ'
  highlight: '- ты'
---

<HeroRandom :type="'pets'"/>

## Кошки
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Собаки
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Волонтеры
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Приюты
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>