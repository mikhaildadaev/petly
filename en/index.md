---
layout: home
main:
  - type: 'general'
    list:
      - name: 'Title 1'
        description: 'Description 1'
        img: 'Image 1'
        link: 'Link 1'
      - name: 'Title 2'
        description: 'Description 2'
        img: 'Image 2'
        link: 'Link 2'
  - type: 'join'
    list:
      - name: 'Join us'
        description: 'Share your care with those who are waiting — become part of our volunteer movement'
        img: '/assets/webp/page_join.webp'
        link: '/en/dobrology/join'
  - type: 'support'
    list:
      - name: 'Support'
        description: 'Food, medicine, beds and toys — every item helps animals live better'
        img: '/assets/webp/page_support.webp'
        link: '/en/dobrology/support'
---

<MainSlider :type="'general'"/>
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>
<ItemsRandom :type="'pets'" :item-type="'cats'"/>
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>
<MainBlock :type="'support'"/>
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>
<MainBlock :type="'join'"/>