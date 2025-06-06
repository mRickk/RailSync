<script lang="ts" setup>
import router from '@/router';
import { ref } from 'vue';
import Input from '@/components/Input.vue';
import FormContainer from '@/components/FormContainer.vue';
import FormContainerItem from '@/components/FormContainerItem.vue';
import { PASSWORD_MIN_LENGTH } from '@/utils/constants.js';
import { authenticate } from '@/api/users.js';

const username = ref<string>('');
const password = ref<string>('');
const loginInProgress = ref(false);
const loginError = ref<string | null>(null);

const validateUsername = (value: string) => value.trim().length > 0;
const validatePassword = (value: string) => value.trim().length >= PASSWORD_MIN_LENGTH;

async function login() {
  if (loginInProgress.value) return;

  loginInProgress.value = true;
  loginError.value = null;

  try {
    await authenticate(username.value, password.value);
    router.push({ path: '/home' });

  } catch (error) {
    loginError.value = 'Login failed: ' + (error as Error).message;
  } finally {
    loginInProgress.value = false;
  }
}
</script>

<template>
  <FormContainer>
    <FormContainerItem>
      <h2 class="text-center">Login</h2>
      <div v-if="loginError" class="alert alert-danger" role="alert">
        <div class="error-message">
          {{ loginError }}
        </div>
      </div>

      <form @submit.prevent="login" class="form">
        <div class="input-group">
          <Input
              :dont-autocapitalize="true"
              v-model="username"
              type="text"
              id="username"
              :validation-function="validateUsername"
              :error-message="'(Username is required)'"
          >
            Username
          </Input>
        </div>

        <div class="input-group">
          <Input
              v-model="password"
              type="password"
              id="password"
              :validation-function="validatePassword"
              :error-message="`(Password must be at least ${PASSWORD_MIN_LENGTH} characters long)`"
          >
            Password
          </Input>
        </div>

        <button :disabled="loginInProgress" class="btn btn-primary btn-lg mx-auto" type="submit">
          <div v-if="loginInProgress" class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          Login
        </button>
      </form>

      <div class="text-center mt-3">
        <p>Don't have an account? <router-link to="/signup" class="link-primary">Sign up</router-link></p>
      </div>
    </FormContainerItem>
  </FormContainer>
</template>


<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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