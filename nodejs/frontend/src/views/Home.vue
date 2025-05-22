<template>
  <div class="home-container">
    <h1 class="text-2xl font-bold mb-4">Search trains solutions for your next trip!</h1>

    <div class="w-full max-w-2xl space-y-3">
      <!-- Stazioni di partenza e arrivo -->
      <div class="d-flex flex-wrap gap-3">
        <b-form-group label="From station" label-for="from-station" class="flex-fill"  style="min-width: 400px;">
          <StationAutocomplete v-model="fromStation" />
        </b-form-group>

        <b-form-group label="To station" label-for="to-station" class="flex-fill" style="min-width: 400px;">
          <StationAutocomplete v-model="toStation" />
        </b-form-group>
      </div>

      <!-- Data e orario di partenza -->
      <label for="departure-time" class="block font-semibold mb-1">Departure Time</label>
      <Datepicker v-model="departureDate" class="w-full" />

      <!-- Pulsante di ricerca -->
      <div class="d-flex flex-wrap gap-3">
        <div class="flex-fill" style="min-width: 350px;">
          <b-button class="mt-4 w-100" variant="primary" @click="handleSearch">
            {{ loadingSolutions ? 'Searching...' : 'Search' }}
          </b-button>
        </div>
      </div>
    
    </div>

    <div v-if="error" class="mt-4 text-danger">
      {{ error }}
    </div>

    <!-- Risultati -->
    <div v-if="results.length" class="mt-5 w-full max-w-2xl" style="min-width: 800px;">
      <!-- <h2 class="text-xl font-semibold mb-2">Results:</h2> -->
      <ul class="list-group">
        <li class="list-group-item flex justify-between items-center" v-for="result in results" :key="result.id">
          <div class="flex-grow">
            <strong>Departure:</strong> {{ result.departure }},
            <strong>Arrival:</strong> {{ result.arrival }},
            <strong>Duration:</strong> {{ result.duration }}
          </div>
          <router-link :to="`/booking/${result.id}`" class="btn btn-primary mt-2" >
            Buy
          </router-link>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { get_stations } from '@/api/stations.js'
import { searchSolution } from '@/api/solutions.js'
import StationAutocomplete from '@/components/StationAutocomplete.vue'

export default {
  components: { StationAutocomplete, Datepicker },
  data() {
    return {
      fromStation: '',
      toStation: '',
      departureDate: new Date(),
      loadingSolutions: false,
      error: '',
      results: [],
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

      this.loadingSolutions = true
      try {
        const data = await searchSolution(
          this.fromStation,
          this.toStation,
          this.departureDate.toISOString()
        )
        this.results = data
      } catch (e) {
        this.error = 'Error fetching train data'
      } finally {
        this.loadingSolutions = false
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
