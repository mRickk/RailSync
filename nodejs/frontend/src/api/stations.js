import { API_BASE_URL } from '@/utils/constants.js';

export async function get_all_stations() {
    const response = await fetch(`${API_BASE_URL}/stations`, {
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