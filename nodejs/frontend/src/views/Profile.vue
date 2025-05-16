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

            <div class="pt-2">
                <button type="submit" class="btn-primary w-full" :disabled="loading">
                    {{ isEditing ? (loading ? "Salvataggio..." : "Salva modifiche") : "Modifica" }}
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
import { getUser, updateUser } from '@/api/user.js'

const validateUsername = (value) => value.trim().length > 0;
const validateNotEmpty = (value) => value.trim().length > 0;
const validateEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value.trim());
};

const originalForm = reactive({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
})

const form = reactive({
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
        form.last_name !== originalForm.last_name
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
        await updateUser({
            username: form.username,
            email: form.email,
            first_name: form.first_name,
            last_name: form.last_name,
        })
        message.value = 'Profilo aggiornato con successo.'
    } catch (err) {
        error.value = err.message
    } finally {
        fetchUser();
        isEditing.value = false
        loading.value = false
    }
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
