<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getUser } from '@/api/users.js';
import { getSolution } from '@/api/solutions.js';
import { bookSeat, getOccupiedSeats } from '@/api/reservations.js';

const router = useRouter();
const route = useRoute();
const solutionId = computed(() => route.params.solution_id);
const solution = ref(null);
const occupiedSeats = ref({});
const trains = computed(() => solution.value?.nodes.map(node => node.train.train_id) || []);
const currentTrainIdx = ref(0);

interface Seat {
  id: string;
  label: string;
  status: 'available' | 'selected' | 'occupied';
}

const rows = 12;
const seatsPerRow = 4; // A, B, C, D
const seatLayouts = reactive<Seat[][][]>([]); // [train][row][seat]
const selectedSeats = ref<(string | null)[]>([]); // [trainIdx] = seatId

const generateSeatLayouts = () => {
  seatLayouts.length = 0;
  for (const train_id of trains.value) {
    const occupied = occupiedSeats.value[train_id] || [];
    const layout: Seat[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Seat[] = [];
      const labels = ['A', 'B', 'C', 'D'];
      for (let c = 0; c < seatsPerRow; c++) {
        const seatId = `${r + 1}${labels[c]}`;
        row.push({
          id: seatId,
          label: seatId,
          status: occupied.includes(seatId) ? 'occupied' : 'available',
        });
      }
      layout.push(row);
    }
    seatLayouts.push(layout);
  }
  selectedSeats.value = Array(trains.value.length).fill(null);
};

const handleSeatClick = (seat: Seat) => {
  if (seat.status === 'occupied') return;
  const prevSeatId = selectedSeats.value[currentTrainIdx.value];
  if (prevSeatId) {
    const prevSeat = findSeatById(currentTrainIdx.value, prevSeatId);
    if (prevSeat) prevSeat.status = 'available';
  }
  selectedSeats.value[currentTrainIdx.value] = seat.id;
  seat.status = 'selected';
};

const findSeatById = (trainIdx: number, id: string): Seat | undefined => {
  for (const row of seatLayouts[trainIdx]) {
    const seat = row.find((s) => s.id === id);
    if (seat) return seat;
  }
  return undefined;
};

const switchTrain = (direction: 'prev' | 'next') => {
  if (direction === 'prev' && currentTrainIdx.value > 0) {
    currentTrainIdx.value--;
  } else if (direction === 'next' && currentTrainIdx.value < trains.value.length - 1) {
    currentTrainIdx.value++;
  }
};

interface UserInfo {
  firstName: string;
  lastName: string;
}
const userInfo = reactive<UserInfo>({
  firstName: '',
  lastName: '',
});
const fetchUserInfo = async () => {
  try {
    const user = await getUser();
    userInfo.firstName = user.first_name;
    userInfo.lastName = user.last_name;
  } catch (error) {
    console.error('Failed to fetch user info:', error);
  }
};

const isSubmitting = ref(false);
const bookingError = ref<string | null>(null);

const canSubmit = computed(() => {
  return selectedSeats.value.every(seatId => !!seatId) && userInfo.firstName && userInfo.lastName;
});

const completeReservation = async () => {
  if (!canSubmit.value || isSubmitting.value) return;
  isSubmitting.value = true;
  bookingError.value = null;

  try {
    const seats = trains.value.map((train, idx) => ({
      seat: selectedSeats.value[idx],
      train_id: train,
      departure_time: solution.value.nodes[idx].departure_time,
      arrival_time: solution.value.nodes[idx].arrival_time,
    }));

    await bookSeat({
      solution_id: solutionId.value,
      name: userInfo.firstName,
      surname: userInfo.lastName,
      seats,
    });
  } catch (error) {
    bookingError.value = error.message || 'Failed to complete reservation.';
  } finally {
    isSubmitting.value = false;
    router.push('/reservations');
  }
};

const cancelReservation = () => {
  router.push('/home');
};

onMounted(async () => {
  try {
    solution.value = await getSolution(solutionId.value);
    if (!solution.value) {
      throw new Error('Solution not found');
    }
    occupiedSeats.value = await getOccupiedSeats(solutionId.value);
    console.log('Occupied seats:', occupiedSeats.value);
    generateSeatLayouts();
    fetchUserInfo();
  } catch (error) {
    console.error('Failed to load booking data:', error);
    router.push('/home');
    return;
  }
});
</script>

<template>
  <div class="booking-page">
    <h1>Complete Your Booking</h1>

    <section class="seat-selector-section">
      <h2>Select Your Seat for Each Train</h2>
      <div class="train-controls">
        <button class="btn btn-secondary" @click="switchTrain('prev')" :disabled="currentTrainIdx === 0">
          &lt; Previous Train
        </button>
        <span>
          Train {{ currentTrainIdx + 1 }}: {{ trains[currentTrainIdx] || 'N/A' }}
        </span>
        <button class="btn btn-secondary" @click="switchTrain('next')" :disabled="currentTrainIdx === trains.length - 1">
          Next Train &gt;
        </button>
      </div>

      <div class="seat-map-container">
        <div v-for="(row, rowIndex) in seatLayouts[currentTrainIdx]" :key="`row-${rowIndex}`" class="seat-row">
          <template v-for="(seat, seatIndex) in row" :key="seat.id">
            <div
              class="seat"
              :class="[seat.status]"
              @click="handleSeatClick(seat)"
            >
              {{ seat.label }}
            </div>
            <div v-if="seatIndex === 1" class="aisle"></div>
          </template>
        </div>
      </div>
      <p v-if="selectedSeats[currentTrainIdx]" class="mt-2">
        Selected Seat: <strong>{{ selectedSeats[currentTrainIdx] }}</strong>
      </p>
    </section>

    <section class="selected-seats-section" v-if="trains.length > 1">
      <h3>Selected Seats for All Trains</h3>
      <ul>
        <li v-for="(train, idx) in trains" :key="train">
          {{ train }}: <strong>{{ selectedSeats[idx] || 'None' }}</strong>
        </li>
      </ul>
    </section>

    <section class="personal-info-section">
      <h2>Your Information</h2>
      <form>
        <div class="mb-3">
          <label for="firstName" class="form-label">First Name</label>
          <input type="text" class="form-control" id="firstName" v-model="userInfo.firstName" required />
        </div>
        <div class="mb-3">
          <label for="lastName" class="form-label">Last Name</label>
          <input type="text" class="form-control" id="lastName" v-model="userInfo.lastName" required />
        </div>
      </form>
    </section>

    <section class="action-buttons-section">
      <div v-if="bookingError" class="alert alert-danger">
        {{ bookingError }}
      </div>
      <button
        type="button"
        class="btn btn-primary btn-lg me-2"
        @click="completeReservation"
        :disabled="!canSubmit || isSubmitting"
      >
        <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        {{ isSubmitting ? 'Processing...' : 'Complete Reservation' }}
      </button>
      <button type="button" class="btn btn-secondary btn-lg" @click="cancelReservation" :disabled="isSubmitting">
        Cancel
      </button>
    </section>
  </div>
</template>

<style scoped>
.booking-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

.train-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.seat-map-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.seat-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.seat {
  width: 40px;
  height: 40px;
  margin: 3px;
  border: 1px solid #aaa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  background-color: #fff;
  transition: background-color 0.2s, transform 0.1s;
}

.seat.available {
  background-color: #d4edda;
}

.seat.selected {
  background-color: #007bff;
  color: white;
}

.seat.occupied {
  background-color: #f8d7da;
  cursor: not-allowed;
}

.aisle {
  width: 30px;
  height: 40px;
}
</style>