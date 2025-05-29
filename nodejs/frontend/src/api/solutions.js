import { API_BASE_URL } from '@/utils/constants.js';

export async function searchSolution(from, to, datetime) {
    const params = new URLSearchParams({
        fromStationId: from,
        toStationId: to,
        datetime: datetime
    }).toString();

    const response = await fetch(`${API_BASE_URL}/solutions?${params}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unknown error');
    }

    const data = await response.json();
    return data;
}