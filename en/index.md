---
layout: home
main:
  - type: 'general'
    list:
      - name: 'Title 1'
        description: 'Description 1'
        link: 'Link 1'
      - name: 'Title 2'
        description: 'Description 2'
        link: 'Link 1'
  - type: 'join'
    list:
      - name: 'Title'
        description: 'Description'
        link: 'Link'
  - type: 'support'
    list:
      - name: 'Title'
        description: 'Description'
        link: 'Link'
---

<MainSlider :type="'general'"/>

## Dogs
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Cats
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Shelters
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>

## Support
<MainBlock :type="'support'"/>

## Volunteers
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Join us
<MainBlock :type="'join'"/>