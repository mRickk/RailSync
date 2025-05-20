<template>
  <div class="home-container">
    <h1 class="text-2xl font-bold mb-4">Search Trains Solutions</h1>

    <div class="w-full max-w-2xl space-y-3">
      <div class="d-flex flex-wrap gap-3">
        <b-form-group label="From station" label-for="from-station" class="flex-fill">
          <b-form-select
            id="from-station"
            v-model="fromStation"
            :options="stationOptions"
            placeholder="Select departure station"
          />
        </b-form-group>

        <b-form-group label="To station" label-for="to-station" class="flex-fill">
          <b-form-select
            id="to-station"
            v-model="toStation"
            :options="stationOptions"
            placeholder="Select arrival station"
          />
        </b-form-group>
      </div>

      <label for="departure-time" class="block font-semibold mt-3 mb-1">Departure Time</label>
      <Datepicker v-model="departureDate" class="w-full" />

    </div>

    <b-button class="mt-4" variant="primary" @click="handleSearch" :disabled="loading">
      {{ loading ? 'Searching...' : 'Search' }}
    </b-button>

    <div v-if="error" class="mt-4 text-danger">
      {{ error }}
    </div>

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
      results: [],
      stationOptions: [
      { value: 'Milano Centrale', text: 'Milano Centrale' },
      { value: 'Roma Termini', text: 'Roma Termini' },
      { value: 'Napoli Centrale', text: 'Napoli Centrale' },
      { value: 'Firenze SMN', text: 'Firenze Santa Maria Novella' },
      { value: 'Torino Porta Nuova', text: 'Torino Porta Nuova' }
    ]
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
