<template>
  <div class="home-container">
    <h1 class="text-2xl font-bold mb-4">Search trains solutions for your next trip!</h1>

    <div class="w-full max-w-2xl space-y-3">
      <!-- Stazioni di partenza e arrivo -->
      <div class="d-flex flex-wrap gap-3">
        <b-form-group label="From station" label-for="from-station" class="flex-fill" style="min-width: 400px;">
          <StationAutocomplete v-model="fromStation" />
        </b-form-group>

        <b-form-group label="To station" label-for="to-station" class="flex-fill" style="min-width: 400px;">
          <StationAutocomplete v-model="toStation" />
        </b-form-group>
      </div>

      <!-- Data e orario di partenza -->
      <label for="departure-time" class="block font-semibold mb-1">Departure Time</label>
      <Datepicker v-model="departureDate" class="w-full" :clearable="false" :format="formatEuropeanDate"
        :enable-time-picker="true" />

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
            <strong class="text-primary">
              {{result.trains.map(train => train.denomination + ' ' + train.name).join(' / ')}}
            </strong>
          </div>
          <div class="flex-grow">
            <strong>Departure:</strong> {{ result.origin }} ({{ new Date(result.departureTime).toLocaleString() }})
          </div>
          <div class="flex-grow">
            <strong>Arrival:</strong> {{ result.destination }} ({{ new Date(result.arrivalTime).toLocaleString() }})
          </div>
          <div class="flex-grow">
            <strong>Duration:</strong> {{ result.duration }}
          </div>
          <div class="flex-grow">
            <strong>Cost:</strong>
            {{ result.price ? result.price.amount + result.price.currency : 'N/A' }}
          </div>
            <router-link :to="`/booking/${result.id}`" class="btn btn-primary mt-2"
              :class="{ disabled: result.status !== 'SALEABLE' }" :aria-disabled="result.status !== 'SALEABLE'"
              :tabindex="result.status !== 'SALEABLE' ? -1 : 0"
              @click.prevent="result.status !== 'SALEABLE' && $event.preventDefault()">
              Continue
            </router-link>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { searchSolution } from '@/api/solutions.js'
import StationAutocomplete from '@/components/StationAutocomplete.vue'
import { DateTime } from 'luxon'

export default {
  components: { StationAutocomplete, Datepicker },
  data() {
    return {
      fromStation: '',
      toStation: '',
      departureDate: new Date(),
      loadingSolutions: false,
      loadingContinue: false,
      error: '',
      results: [],
    }
  },
  methods: {
    formatEuropeanDate(date) {
      if (!date) return ''
      return date.toLocaleDateString('it-IT') + ' ' + date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    async handleSearch() {
      this.error = ''
      this.results = []

      if (!this.fromStation || !this.toStation || !this.departureDate) {
        this.error = 'Please fill all fields'
        return
      }

      this.loadingSolutions = true
      try {
        const isoLocal = DateTime.fromJSDate(this.departureDate).toISO()
        const data = await searchSolution(
          this.fromStation,
          this.toStation,
          isoLocal
        )
        this.results = data["solutions"]
          .map((res) => (res.solution))
          // .filter((sol) => sol.status === "SALEABLE")
      } catch (e) {
        this.error = 'Error fetching train data'
      } finally {
        this.loadingSolutions = false
      }
    },
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
