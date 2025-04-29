import { API_BASE_URL } from './constants.js';
import router from '@/router';

export async function authenticate(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}

export async function logout() {
    localStorage.removeItem('authToken');
    router.push('/login');
}