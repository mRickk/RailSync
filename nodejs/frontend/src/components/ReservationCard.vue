<template>
    <b-card :title="title" :sub-title="subtitle" class="mb-3">
      <b-card-text>
        <strong>Departure:</strong> {{ formatDate(reservation.departure_time) }} from {{ reservation.origin }}
      </b-card-text>
      <b-card-text>
        <strong>Arrival:</strong> {{ formatDate(reservation.arrival_time) }} at {{ reservation.destination }}
      </b-card-text>
      <b-card-text v-if="reservation.duration">
        <strong>Duration:</strong> {{ reservation.duration }}
      </b-card-text>
      <b-card-text v-if="reservation.status">
        <strong>Status:</strong> {{ reservation.status }}
      </b-card-text>
      <b-card-text v-if="reservation.price_amount !== undefined && reservation.price_currency">
        <strong>Price:</strong> {{ reservation.price_amount }} {{ reservation.price_currency }}
      </b-card-text>
      <b-card-text>
        <small class="text-muted">Reserved on: {{ formatDate(reservation.reservation_date) }}</small>
      </b-card-text>
  
      <a href="#" class="card-link">View details</a>
      <b-link href="#" class="card-link">Contact support</b-link>
    </b-card>
  </template>
  
  <script>
  export default {
    name: "ReservationCard",
    props: {
      reservation: {
        type: Object,
        required: true,
      },
    },
    computed: {
      title() {
        return `${this.reservation.origin} → ${this.reservation.destination}`;
      },
      subtitle() {
        return `Solution ID: ${this.reservation.solution_id}`;
      },
    },
    methods: {
      formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleString();
      },
    },
  };
  </script>
  
  <style scoped>
  .card-link {
    cursor: pointer;
  }
  </style>
  