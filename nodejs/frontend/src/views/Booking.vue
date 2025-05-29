<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getUser } from '@/api/users.js';
import { bookSeat } from '@/api/reservations.js';

const router = useRouter();

interface Seat {
  id: string;
  label: string;
  status: 'available' | 'selected' | 'occupied';
}

const carriages = 3;
const rows = 12;
const seatsPerRow = 4;
const currentCarriage = ref(1);
const seatLayout = reactive<Seat[][][]>([]);
const selectedSeatId = ref<string | null>(null);
const selectRandomSeat = ref(false);

const generateSeatLayout = () => {
  seatLayout.length = 0;
  for (let w = 0; w < carriages; w++) {
    const carriage: Seat[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Seat[] = [];
      const labels = ['A', 'B', 'C', 'D'];
      for (let c = 0; c < seatsPerRow; c++) {
        row.push({
          id: `C${w + 1}S${r + 1}${labels[c]}`,
          label: `${r + 1}${labels[c]}`,
          status: Math.random() < 0.2 ? 'occupied' : 'available', // Randomly mark some seats as occupied
        });
      }
      carriage.push(row);
    }
    seatLayout.push(carriage);
  }
};

const handleSeatClick = (seat: Seat) => {
  if (selectRandomSeat.value || seat.status === 'occupied') return;

  if (selectedSeatId.value) {
    const prevSeat = findSeatById(selectedSeatId.value);
    if (prevSeat) prevSeat.status = 'available';
  }

  selectedSeatId.value = seat.id;
  seat.status = 'selected';
};

const findSeatById = (id: string): Seat | undefined => {
  for (const carriage of seatLayout) {
    for (const row of carriage) {
      const seat = row.find((s) => s.id === id);
      if (seat) return seat;
    }
  }
  return undefined;
};

const switchCarriage = (direction: 'prev' | 'next') => {
  if (direction === 'prev' && currentCarriage.value > 1) {
    currentCarriage.value--;
  } else if (direction === 'next' && currentCarriage.value < carriages) {
    currentCarriage.value++;
  }
};

watch(selectRandomSeat, (isRandom) => {
  if (isRandom && selectedSeatId.value) {
    const prevSeat = findSeatById(selectedSeatId.value);
    if (prevSeat) prevSeat.status = 'available';
    selectedSeatId.value = null;
  }
});

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
  return (selectedSeatId.value || selectRandomSeat.value) && userInfo.firstName && userInfo.lastName;
});

const completeReservation = async () => {
  if (!canSubmit.value || isSubmitting.value) return;

  isSubmitting.value = true;
  bookingError.value = null;

  let seatToBook = selectedSeatId.value;

  if (selectRandomSeat.value) {
    const availableSeats = seatLayout.flat(2).filter((s) => s.status === 'available');
    if (availableSeats.length > 0) {
      seatToBook = availableSeats[Math.floor(Math.random() * availableSeats.length)].id;
    } else {
      bookingError.value = 'No seats available for random selection.';
      isSubmitting.value = false;
      return;
    }
  }

  try {
    bookSeat({
      solution_id: router.currentRoute.value.params.solution_id,
      name: userInfo.firstName,
      surname: userInfo.lastName,
      seat: seatToBook,
    });
  } catch (error) {
    bookingError.value = error.message || 'Failed to complete reservation.';
  } finally {
    isSubmitting.value = false;
  }
};

const cancelReservation = () => {
  router.push('/home');
};

onMounted(() => {
  generateSeatLayout();
  fetchUserInfo();
});
</script>

<template>
  <div class="booking-page">
    <h1>Complete Your Booking</h1>

    <section class="seat-selector-section">
      <h2>Select Your Seat</h2>
      <div class="form-check mb-3">
        <input
          class="form-check-input"
          type="checkbox"
          id="randomSeatCheck"
          v-model="selectRandomSeat"
        />
        <label class="form-check-label" for="randomSeatCheck">
          Select a random seat for me
        </label>
      </div>

      <div class="carriage-controls">
        <button class="btn btn-secondary" @click="switchCarriage('prev')" :disabled="currentCarriage === 1">
          &lt; Previous Carriage
        </button>
        <span>Carriage {{ currentCarriage }}</span>
        <button class="btn btn-secondary" @click="switchCarriage('next')" :disabled="currentCarriage === carriages">
          Next Carriage &gt;
        </button>
      </div>

      <div class="seat-map-container" :class="{ disabled: selectRandomSeat }">
        <div v-for="(row, rowIndex) in seatLayout[currentCarriage - 1]" :key="`row-${rowIndex}`" class="seat-row">
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
      <p v-if="!selectRandomSeat && selectedSeatId" class="mt-2">
        Selected Seat: <strong>{{ selectedSeatId }}</strong>
      </p>
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

.carriage-controls {
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