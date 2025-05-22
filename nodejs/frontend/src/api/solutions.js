import { API_BASE_URL } from '@/utils/constants.js';

export async function searchSolution(from, to, datetime) {
    // API fittizia
    return Promise.resolve([
      { id: 1, departure: '08:00', arrival: '10:00', duration: '2h' },
      { id: 2, departure: '09:30', arrival: '11:45', duration: '2h 15m' }
    ])

    var endpoint = `${API_BASE_URL}/stations/search`;
    if (name) {
        endpoint += `?name=${name}`
    }
    
    const response = await fetch(endpoint, {
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