---
layout: home
home: 
  name: 'В ДОБРОЛОГИЯХ'
  highlight: '- ты'
---

<MainData :type="'pets'"/>

## Собаки
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Кошки
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Волонтеры
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Приюты
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>