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

export async function getSelectedSeats(solutionId) {
    if (localStorage.getItem("authToken") === null) {
        throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/reservations/${solutionId}/selectedSeats`, {
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

export async function selectSeat(solutionId, trainId, seat) {
    if (localStorage.getItem("authToken") === null) {
        throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/reservations/${solutionId}/select`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
            trainId: trainId,
            seat: seat
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unknown error');
    }

    return await response.json();
}

export async function unselectSeat(solutionId, trainId, seat) {
    if (localStorage.getItem("authToken") === null) {
        throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/reservations/${solutionId}/unselect/${trainId}/${seat}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unknown error');
    }
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