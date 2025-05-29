import { API_BASE_URL } from '@/utils/constants.js';

export async function isTokenValid(authToken) {
    const response = await fetch(`${API_BASE_URL}/users/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authToken }),
    });
    return response.ok;
}