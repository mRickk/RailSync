<template>
  <div>
    <h1 class="ml-3" >All Users</h1>

    <div v-if="loading">Loading users...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else>
      <div v-for="user in users" :key="user._id" class="user-card mx-3">
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Name:</strong> {{ user.first_name }} {{ user.last_name }}</p>
        <p><strong>Registration date:</strong> {{ new Date(user.registration_date).toLocaleString() }}</p>
        <button @click="makeAdmin(user._id)" class="make-admin-button">Make Admin</button>
        <button @click="deleteUserAction(user._id)" class="delete-button">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllUsers, deleteUser, updateUser } from '@/api/users.js';

export default {
  name: "Users",
  data() {
    return {
      users: [],
      loading: false,
      error: null,
    };
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        let data = await getAllUsers();
        data = data.filter(user => user._id !== localStorage.getItem("id") && !user.is_admin); // non mostra l'admin stesso
        this.users = data;
      } catch (err) {
        this.error = 'Failed to load users: ' + err.message;
      } finally {
        this.loading = false;
      }
    },
    async deleteUserAction(userId) {
      if (!confirm("Are you sure you want to delete this user?")) return;

      try {
        await deleteUser(userId);
        this.fetchUsers();
      } catch (err) {
        this.error = 'Failed to delete user: ' + err.message;
      }
    },
    async makeAdmin(userId) {
      if (!confirm("Are you sure you want to make this user an admin?")) return;

      try {
        await updateUser(userId, { is_admin: true });
        this.fetchUsers();
      } catch (err) {
        this.error = 'Failed to make user an admin: ' + err.message;
      }
    }
  },
  created() {
    this.fetchUsers();
  }
}
</script>

<style scoped>
.text-danger {
  color: red;
}
.user-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 5px;
}
.delete-button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;
}
.delete-button:hover {
  background-color: #d9363e;
}
.make-admin-button {
  background-color: #f1d63b;
  color: black;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  margin-top: 8px;
}
.make-admin-button:hover {
  background-color: rgb(197, 162, 65);
}
</style>
