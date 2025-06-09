import { API_BASE_URL } from '@/utils/constants.js';

export async function searchSolution(from, to, datetime) {

    if (localStorage.getItem("authToken") === null) {
        throw new Error("User not authenticated");
    }

    const params = new URLSearchParams({
        fromStationId: from,
        toStationId: to,
        datetime: datetime
    }).toString();

    const response = await fetch(`${API_BASE_URL}/solutions?${params}`, {
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

export async function getSolution(solutionId) {
    if (localStorage.getItem("authToken") === null) {
        throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/solutions/${solutionId}`, {
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

export async function clearUnusedSolutions() {
    if (localStorage.getItem("authToken") === null) {
        throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/solutions`, {
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

    return response; // No content
}