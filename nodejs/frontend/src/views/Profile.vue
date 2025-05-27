<template>
    <div class="max-w-md mx-auto p-6 sm:px-6 bg-white rounded-2xl">
        <!-- <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Profilo Utente</h2> -->

        <form @submit.prevent="handleButtonClick" class="space-y-5 m-4">
            <div>
                <Input :dont-autocapitalize="true" v-model="form.username" type="text" id="username"
                    :validation-function="validateUsername" :error-message="'(Invalid username)'"
                    :disabled="!isEditing">
                Username
                </Input>
                <!-- <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input v-model="form.username" type="text" class="input" :disabled="!isEditing"
                    :validation-function="validateUsername" /> -->
            </div>

            <div>
                <Input v-model="form.email" type="email" id="email" :validation-function="validateEmail"
                    :error-message="'(Invalid email format)'" :disabled="!isEditing">
                Email
                </Input>
                <!-- <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input v-model="form.email" type="email" class="input" :disabled="!isEditing" /> -->
            </div>

            <div>
                <Input v-model="form.first_name" type="text" id="first-name" :validation-function="validateNotEmpty"
                    :error-message="'(First name is required)'" :disabled="!isEditing">
                First Name
                </Input>
                <!-- <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input v-model="form.first_name" type="text" class="input" :disabled="!isEditing" /> -->
            </div>

            <div>
                <Input v-model="form.last_name" type="text" id="last-name" :validation-function="validateNotEmpty"
                    :error-message="'(Last name is required)'" :disabled="!isEditing" >
                Last Name
                </Input>
                <!-- <label class="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
                <input v-model="form.last_name" type="text" class="input" :disabled="!isEditing" /> -->
            </div>

            <!-- Cambia password -->
            <div v-if="isEditing">
                <Input
                    v-model="form.password"
                    type="password"
                    id="password"
                    :validation-function="validatePassword"
                    :error-message="'(Min. 6 caratteri)'"
                    :required="false"
                    :disabled="!isEditing"
                >
                New Password
                </Input>
                
                <Input
                    v-model="form.confirm_password"
                    type="password"
                    id="confirm-password"
                    :validation-function="validateConfirmPassword"
                    :error-message="'(Passwords do not match)'"
                    :required="false"
                    :disabled="!isEditing"
                >
                Confirm Password
                </Input>
            </div>


            <div class="pt-2">
                <button v-if="isEditing" type="button" class="btn-primary w-full" @click="backButtonClick">
                    Cancel
                </button>
                <button type="submit" class="btn-primary w-full" :disabled="loading">
                    {{ isEditing ? (loading ? "Saving..." : "Save changes") : "Edit" }}
                </button>
            </div>
            
        </form>

        <p v-if="message" class="mt-4 text-green-600 text-center">{{ message }}</p>
        <p v-if="error" class="mt-4 text-red-800 text-center">{{ error }}</p>
    </div>
</template>

<script setup>
import Input from '@/components/Input.vue';
import { reactive, ref, onMounted } from 'vue'
import { getUser, updateUser } from '@/api/users.js'
import { PASSWORD_MIN_LENGTH, API_BASE_URL } from '@/utils/constants.js';

const validateUsername = (value) => value.trim().length > 0;
const validateNotEmpty = (value) => value.trim().length > 0;
const validateEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value.trim());
};
const validatePassword = (value) => value.trim().length === 0 || value.trim().length >= PASSWORD_MIN_LENGTH;

const validateConfirmPassword = (value) => value === form.password;

const form = reactive({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: ''
})

const originalForm = reactive({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
})


const isFormChanged = () => {
    return (
        form.username !== originalForm.username ||
        form.email !== originalForm.email ||
        form.first_name !== originalForm.first_name ||
        form.last_name !== originalForm.last_name ||
        form.password.trim().length !== 0
    )
}

const isEditing = ref(false)
const loading = ref(false)
const message = ref('')
const error = ref('')

const fetchUser = async () => {
    try {
        const user = await getUser()
        form.username = user.username
        form.email = user.email
        form.first_name = user.first_name
        form.last_name = user.last_name

        originalForm.username = user.username
        originalForm.email = user.email
        originalForm.first_name = user.first_name
        originalForm.last_name = user.last_name
    } catch (err) {
        error.value = 'Errore nel recupero delle informazioni utente.'
    }
}

onMounted(fetchUser)

const handleButtonClick = async () => {
    if (!isEditing.value) {
        isEditing.value = true
        return
    }

    if (!isFormChanged()) {
        return
    }

    loading.value = true
    message.value = ''
    error.value = ''

    try {
        if (form.password !== form.confirm_password) {
            throw new Error("Passwords do not match.");
        }

        const payload = {
            username: form.username,
            email: form.email,
            first_name: form.first_name,
            last_name: form.last_name,
        }

        if (form.password.trim().length > 0) {
            payload.password = form.password
        }

        await updateUser(payload)
        message.value = 'Profilo aggiornato con successo.'
        isEditing.value = false
        form.password = ''
        form.confirm_password = ''
    } catch (err) {
        error.value = err.message
    } finally {
        fetchUser();
        loading.value = false
    }
}

const backButtonClick = async () => {
    if (!isEditing.value) {
        return
    }

    isEditing.value = false
    form.username = originalForm.username
    form.email = originalForm.email
    form.first_name = originalForm.first_name
    form.last_name = originalForm.last_name
    form.password = ''
    form.confirm_password = ''
}
</script>

<style scoped>
.input {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background-color: #f9fafb;
    transition: border-color 0.2s ease;
}

.input:focus {
    outline: none;
    border-color: #3b82f6;
    background-color: #fff;
}

.input:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
}

.btn-primary {
    background-color: #3b82f6;
    color: white;
    padding: 0.6rem 1rem;
    font-weight: 600;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
    background-color: #2563eb;
}

.btn-primary:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
}
</style>
