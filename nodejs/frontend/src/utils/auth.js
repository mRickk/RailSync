import { API_BASE_URL } from './constants.js';
import router from '@/router';

async function getUserInfo(username) {
    const response = await fetch(`${API_BASE_URL}/users?username=${username}`, {
        method: 'get',
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
    const user = data[0];
    
    localStorage.setItem('id', user._id);
    localStorage.setItem('first_name', user.first_name);
    localStorage.setItem('last_name', user.last_name);
    localStorage.setItem('email', user.email);
}

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
    
    await getUserInfo(username);
}

export async function logout() {
    localStorage.removeItem('authToken');
    router.push('/login');
}