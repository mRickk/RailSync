<script lang="ts" setup>
import { logout } from '@/utils/auth.js';
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';

const route = useRoute();
const isAdmin = ref(false);

onMounted(() => {
  const raw = localStorage.getItem('is_admin')
  isAdmin.value = raw === 'true' // converte correttamente in boolean
})

</script>

<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="#">Rail Sync</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="/home" :active="route.path === '/home'" >Home</b-nav-item>
          <b-nav-item href="/reservations" :active="route.path === '/reservations'" >Reservations</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown
            v-if="isAdmin"
            right
            :toggle-class="{ active: route.path.startsWith('/admin') }"
          >
            <template #button-content>
              Admin Panel
            </template>
            <b-dropdown-item href="/admin/users">User Management</b-dropdown-item>
            <b-dropdown-item href="/admin/reservations">Reservation Management</b-dropdown-item>
          </b-nav-item-dropdown>


          <b-nav-item-dropdown right>
            <template #button-content>
              <i class="bi bi-person-circle" style="font-size: 1.2rem;"></i>
            </template>
            <b-dropdown-item href="/profile">Profile</b-dropdown-item>
            <b-dropdown-item @click="logout">Sign Out</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<style scoped>

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.15);
  font-weight: bold;
  border-radius: 0.25rem;
}

</style>