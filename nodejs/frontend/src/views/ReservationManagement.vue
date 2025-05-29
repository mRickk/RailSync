<template>
  <div>
    <h1 class="ml-3" >All Reservations</h1>

    <div v-if="loading">Loading users...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else>
      <div v-for="resSol in reservations" :key="resSol._id" class="user-card mx-3">
        <p><strong>{{ resSol.sol.origin }} → {{ resSol.sol.destination }}</strong></p>
        <p><strong>Passenger:</strong> {{ resSol.res.name }} {{ resSol.res.surname }} </p>
        <p><strong>Reservation date:</strong> {{ new Date(resSol.res.reservation_date).toLocaleString() }}</p>
        <button @click="deleteReservationAction(resSol.res._id)" class="delete-button">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllReservations, deleteReservation } from '@/api/reservations.js';

export default {
  name: "ReservationManagement",
  data() {
    return {
      reservations: [],
      loading: false,
      error: null,
    };
  },
  methods: {
    async fetchReservations() {
      this.loading = true;
      this.error = null;
      try {
        let data = await getAllReservations();
        data = data.filter(reservation => reservation._id !== localStorage.getItem("id")); // non mostra l'admin stesso
        this.reservations = data;
      } catch (err) {
        this.error = 'Failed to load users: ' + err.message;
      } finally {
        this.loading = false;
      }
    },
    async deleteReservationAction(reservationId) {
      if (!confirm("Are you sure you want to delete this reservation?")) return;

      try {
        await deleteReservation(reservationId);
        this.fetchReservations();
      } catch (err) {
        this.error = 'Failed to delete reservation: ' + err.message;
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
.user-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 5px;
}
.delete-button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;
}
.delete-button:hover {
  background-color: #d9363e;
}
</style>
