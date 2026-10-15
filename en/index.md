---
layout: home
hero:
  name: 'IN GOODOLOGY'
  highlight: '- you'
---

<HomeStyle :type="'pets'"/>

## Cats
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Dogs
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Shelters
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>

## Volunteers
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>