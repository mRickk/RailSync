<template>
  <div>
    <h1>Reservations</h1>

    <div v-if="loading">Loading reservations...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else>
      <ReservationCard 
        v-for="resSol in resSols"
        :key="resSol.res._id"
        :resSol="resSol"
      />
    </div>
  </div>
</template>

<script>
import ReservationCard from '@/components/ReservationCard.vue';

export default {
  name: "Reservations",
  components: { ReservationCard },
  data() {
    return {
      resSols: [],
      loading: false,
      error: null,
    };
  },
  methods: {
    async fetchReservations() {
      this.loading = true;
      this.error = null;
      try {
        const res = await fetch(`http://localhost:3000/api/users/${localStorage.getItem("id")}/reservations`, {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("authToken")}`
          },  
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        this.resSols = data;
      } catch (err) {
        this.error = 'Failed to load reservations: ' + err.message;
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.fetchReservations();
  }
}
</script>

<style scoped>
.text-danger {
  color: red;
}
</style>
