import { API_BASE_URL } from '@/utils/constants.js';

export async function bookSeat(reservationBody) {
    if (localStorage.getItem("authToken") === null) {
        throw new Error("User not authenticated");
    }
    if (localStorage.getItem("id") === null) {
        throw new Error("Id not found");
    }
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
}

export async function getOccupiedSeats(solutionId) {
    if (localStorage.getItem("authToken") === null) {
        throw new Error("User not authenticated");
    }
    const response = await fetch(`${API_BASE_URL}/reservations/${solutionId}/occupiedSeats`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unknown error');
    }

    return await response.json();
}