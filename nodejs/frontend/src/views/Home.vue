<script lang="ts" setup>
import { logout } from '@/utils/auth.js';

</script>

<template>
  <div class="home-container">
    <h1>Benvenuto nella Home</h1>
    <p>Sei autenticato.</p>

    <button @click="logout" class="btn btn-primary btn-lg mx-auto">
      Logout
    </button>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}
</style>
