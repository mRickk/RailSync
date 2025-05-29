import { API_BASE_URL } from '@/utils/constants.js';

export async function getAllReservations() {
    if (localStorage.getItem("authToken") === null) {
        throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unknown error');
    }

    const data = await response.json();
    return data;
}

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

export async function deleteReservation(reservationId) {
    if (localStorage.getItem("authToken") === null) {
        throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unknown error');
    }
}