<script lang="ts" setup>
import router from '@/router';
import { ref } from 'vue';
import Input from '@/components/Input.vue';
import FormContainer from '@/components/FormContainer.vue';
import FormContainerItem from '@/components/FormContainerItem.vue';
import { PASSWORD_MIN_LENGTH, API_BASE_URL } from '@/utils/constants.js';
import { authenticate } from '@/utils/auth.js';

const username = ref('');
const password = ref('');
const email = ref('');
const firstName = ref('');
const lastName = ref('');
const signupInProgress = ref(false);
const signupError = ref<string | null>(null);

const validateNotEmpty = (value: string) => value.trim().length > 0;
const validatePassword = (value: string) => value.trim().length >= PASSWORD_MIN_LENGTH;

async function signup() {
  if (signupInProgress.value) return;

  signupInProgress.value = true;
  signupError.value = null;

  try {
    const response = await fetch(API_BASE_URL + '/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
        first_name: firstName.value,
        last_name: lastName.value,
      }),
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    const token = await authenticate(username.value, password.value);

    if (token) {
      localStorage.setItem('authToken', token);
      router.push({ path: '/home' });
    } else {
      loginError.value = 'Invalid username or password.';
    }

  } catch (error) {
    signupError.value = 'Signup failed. ' + (error as Error).message;
  } finally {
    signupInProgress.value = false;
  }
}
</script>

<template>
  <h2 class="text-center">Sign Up</h2>
  <FormContainer>
    <FormContainerItem>
      <div v-if="signupError" class="alert alert-danger" role="alert">
        <div class="error-message">
          {{ signupError }}
        </div>
      </div>

      <form @submit.prevent="signup" class="form">
        <div class="input-group">
          <Input v-model="firstName" type="text" id="first-name" :validation-function="validateNotEmpty" :error-message="'(First name is required)'">
            First Name
          </Input>
        </div>

        <div class="input-group">
          <Input v-model="lastName" type="text" id="last-name" :validation-function="validateNotEmpty" :error-message="'(Last name is required)'">
            Last Name
          </Input>
        </div>

        <div class="input-group">
          <Input v-model="email" type="email" id="email" :validation-function="validateNotEmpty" :error-message="'(Email is required)'">
            Email
          </Input>
        </div>

        <div class="input-group">
          <Input v-model="username" type="text" id="username" :validation-function="validateNotEmpty" :error-message="'(Username is required)'">
            Username
          </Input>
        </div>

        <div class="input-group">
          <Input v-model="password" type="password" id="password" :validation-function="validatePassword" :error-message="`(Password must be at least ${PASSWORD_MIN_LENGTH} characters long)`">
            Password
          </Input>
        </div>

        <button :disabled="signupInProgress" class="btn btn-primary btn-lg mx-auto" type="submit">
          <div v-if="signupInProgress" class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          Sign Up
        </button>
      </form>

      <div class="text-center mt-3">
        <p>Already have an account? <router-link to="/login" class="link-primary">Log in</router-link></p>
      </div>
    </FormContainerItem>
  </FormContainer>
</template>



<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 400px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
}

.input-group {
  position: relative;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}

.error-message {
  font-size: 0.875rem;
  font-family: 'Inter', sans-serif;
  color: #721c24;
  background-color: #f8d7da;
  padding: 0.5rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  font-family: 'Inter', sans-serif;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

.spinner-border {
  margin-right: 0.5rem;
}
</style>