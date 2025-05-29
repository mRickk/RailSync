import { API_BASE_URL } from '@/utils/constants.js';

export async function authenticate(username, password) {
    const response = await fetch(`${API_BASE_URL}/users/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unknown error');
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('id', data.id);
}

export async function isTokenValid(authToken) {
    const response = await fetch(`${API_BASE_URL}/users/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authToken }),
    });
    return response.ok;
}