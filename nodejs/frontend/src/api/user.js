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
        throw error; // Rethrow the error to be handled by the caller
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

    if (localStorage.getItem("id") === null) {
        throw new Error("Id not found");
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

    if (localStorage.getItem("id") === null) {
        throw new Error("Id not found");
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