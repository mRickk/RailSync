<script lang="ts" setup>
import router from '@/router';
import { ref } from 'vue';
import Input from '@/components/Input.vue';
import FormContainer from '@/components/FormContainer.vue';
import FormContainerItem from '@/components/FormContainerItem.vue';

const username = ref<string>('');
const password = ref<string>('');
const loginInProgress = ref(false);
const PASSWORD_MIN_LENGTH = 8;

const validateUsername = (value: string) => value.trim().length > 0;
const validatePassword = (value: string) => value.trim().length >= PASSWORD_MIN_LENGTH;

const notifyError = () =>
  console.error('Login failed. Please check your credentials.');

async function authenticate(username: string, password: string): Promise<string | null> {
  try {
    const response = await fetch('/api/users/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    return data.token; // Return the JWT token
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

async function login() {
  if (loginInProgress.value) return;

  loginInProgress.value = true;

  try {
    const token = await authenticate(username.value, password.value);

    if (token) {
      localStorage.setItem('authToken', token);
      router.push({ path: '/' });
    } else {
      notifyError();
    }
  } catch (error) {
    notifyError();
  } finally {
    loginInProgress.value = false;
  }
}
</script>

<template>
  <h2 class="text-center">Login</h2>
  <FormContainer>
    <FormContainerItem>
      <form @submit.prevent="login" class="d-flex flex-column justify-content-center">
        <Input
          :dont-autocapitalize="true"
          v-model="username"
          type="text"
          id="username"
          :validation-function="validateUsername"
          :error-message="'Username is required'"
        >
          Username
        </Input>

        <Input
          v-model="password"
          type="password"
          id="password"
          :validation-function="validatePassword"
          :error-message="'Password must be at least 6 characters long'"
        >
          Password
        </Input>

        <button :disabled="loginInProgress" class="btn btn-primary btn-lg mx-auto" type="submit">
          <div v-if="loginInProgress" class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          Login
        </button>
      </form>
    </FormContainerItem>
  </FormContainer>
</template>