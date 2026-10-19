---
layout: home
hero:
  name: 'IN GOODOLOGY'
  highlight: '- you'
---

<HomeStyle :type="'pets'"/>

## Dogs
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Cats
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Shelters
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>

## Volunteers
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>