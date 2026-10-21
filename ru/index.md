---
layout: home
main:
  - type: 'general'
    list:
      - name: 'Заголовок 1'
        description: 'Описание 1'
        link: 'Ссылка 1'
      - name: 'Заголовок 2'
        description: 'Описание 2'
        link: 'Ссылка 1'
  - type: 'join'
    list:
      - name: 'Заголовок'
        description: 'Описание'
        link: 'Ссылка'
  - type: 'support'
    list:
      - name: 'Заголовок'
        description: 'Описание'
        link: 'Ссылка'
---

<MainSlider :type="'general'"/>

## Собаки
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Кошки
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Приюты
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>

## Поддержать
<MainBlock :type="'support'"/>

## Волонтеры
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Присоединиться
<MainBlock :type="'join'"/>