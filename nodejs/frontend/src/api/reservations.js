import { API_BASE_URL } from '@/utils/constants.js';

export async function bookSeat(reservationBody) {
    const response = await fetch(`${API_BASE_URL}/users/${localStorage.getItem("id")}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(reservationBody),
    });

    if (!response.ok) {
      throw new Error('Failed to complete reservation.');
    }

    alert(`Reservation completed for seat ${seatToBook}!`);
    router.push('/reservations');
}