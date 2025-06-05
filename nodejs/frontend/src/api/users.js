import { API_BASE_URL } from '@/utils/constants.js';

export async function updateUser(data) {
    try {
        if (localStorage.getItem("authToken") === null) {
            throw new Error("User not authenticated");
        }

        if (localStorage.getItem("id") === null) {
            throw new Error("Id not found");
        }

        const response = await fetch(`${API_BASE_URL}/users/${localStorage.getItem("id")}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("authToken")}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }

}

export async function getUser() {
    if (localStorage.getItem("authToken") === null) {
        throw new Error("User not authenticated");
    }

    if (localStorage.getItem("id") === null) {
        throw new Error("Id not found");
    }

    const response = await fetch(`${API_BASE_URL}/users/${localStorage.getItem("id")}`, {
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

export async function getAllUsers() {
    if (localStorage.getItem("authToken") === null) {
        throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
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

export async function deleteUser(userId) {
    if (localStorage.getItem("authToken") === null) {
        throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
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

export async function authenticate(username, password) {
    const response = await fetch(`${API_BASE_URL}/users/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Unknown error');
    }

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('id', data.id);
    localStorage.setItem('is_admin', data.is_admin);
}