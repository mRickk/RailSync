<template>
  <b-card :title="title" :sub-title="subtitle" class="mb-3">
    <b-card-text
      v-for="(node, index) in resSol.sol.nodes"
      :key="index"
    >
      Departure:
      {{ formatDate(node.departure_time) }} from <strong>{{ node.origin }}</strong><br />

      Arrival:
      {{ formatDate(node.arrival_time) }} at <strong>{{ node.destination }}</strong><br />

      Train: <strong>{{ node.train.train_id }}</strong><br />
      Seat: <strong>{{ resSol.res.seats.find(s => s.train_id === node.train.train_id).seat }}</strong>
    </b-card-text>

    <b-card-text>
      Duration: <strong>{{ resSol.sol.duration }}</strong> Price: <strong>{{ resSol.sol.price_amount }} {{ resSol.sol.price_currency }}</strong>
    </b-card-text>
    <b-card-text>
      Passenger: <strong>{{ resSol.res.name }} {{ resSol.res.surname }}</strong>
    </b-card-text>
    <b-card-text>
      <small class="text-muted"
        >Reserved on: {{ formatDate(resSol.res.reservation_date) }}</small
      >
    </b-card-text>

    <!-- <a href="#" class="card-link">View details</a> -->
  </b-card>
</template>

<script>
export default {
  name: "ReservationCard",
  props: {
    resSol: {
      type: Object,
      required: true,
    },
  },
  computed: {
    title() {
      return `${this.resSol.sol.origin} → ${this.resSol.sol.destination}`;
    },
    subtitle() {
      return `Solution ID: ${this.resSol.solution_id}`;
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      // if (d.toISOString() == date) {
      //   d.setHours(d.getHours() + 2); // Local timezone
      // }
      return d.toLocaleString();
    },
  },
};
</script>

<style scoped>
.card-link {
  cursor: pointer;
}
</style>
