<template>
  <Navbar v-if="showNavbar" />
  <router-view />
</template>

<script setup>
  import { useRoute } from 'vue-router'
  import { computed } from 'vue'
  import Navbar from '@/views/Navbar.vue'

  const route = useRoute()
  const showNavbar = computed(() =>
    !['/login', '/signup'].includes(route.path)
  )
</script>
