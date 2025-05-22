import { API_BASE_URL } from '@/utils/constants.js';

export async function get_stations(name) {
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