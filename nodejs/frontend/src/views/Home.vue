<template>
  <div class="home-container">
    <h1 class="text-2xl font-bold mb-4">Search Trains Solutions</h1>

    <div class="w-full max-w-2xl space-y-3">
      <!-- Stazioni -->
      <b-input-group>
        <b-form-input
          v-model="fromStation"
          placeholder="Starting station"
          aria-label="From station"
        />
        <b-form-input
          v-model="toStation"
          placeholder="Arriving station"
          aria-label="To station"
        />
      </b-input-group>

      <!-- Data e orario di partenza -->
      <label for="departure-time" class="block font-semibold mt-3 mb-1">Departure Time</label>
      <Datepicker v-model="departureDate" class="w-full" />

    </div>

    <!-- Pulsante di ricerca -->
    <b-button class="mt-4" variant="primary" @click="handleSearch" :disabled="loading">
      {{ loading ? 'Searching...' : 'Search' }}
    </b-button>

    <!-- Errore -->
    <div v-if="error" class="mt-4 text-danger">
      {{ error }}
    </div>

    <!-- Risultati -->
    <div v-if="results.length" class="mt-5 w-full max-w-md">
      <!-- <h2 class="text-xl font-semibold mb-2">Results:</h2> -->
      <ul class="list-group">
        <li class="list-group-item" v-for="result in results" :key="result.id">
          <strong>Departure:</strong> {{ result.departure }},
          <strong>Arrival:</strong> {{ result.arrival }},
          <strong>Duration:</strong> {{ result.duration }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { searchSolution } from '@/api/solutions.js'

export default {
  components: { Datepicker },
  data() {
    return {
      fromStation: '',
      toStation: '',
      departureDate: new Date(),
      loading: false,
      error: '',
      results: []
    }
  },
  methods: {
    async handleSearch() {
      this.error = ''
      this.results = []

      if (!this.fromStation || !this.toStation || !this.departureDate) {
        this.error = 'Please fill all fields'
        return
      }

      this.loading = true
      try {
        const data = await searchSolution(
          this.fromStation,
          this.toStation,
          this.departureDate
        )
        this.results = data
      } catch (e) {
        this.error = 'Error fetching train data'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}
</style>
