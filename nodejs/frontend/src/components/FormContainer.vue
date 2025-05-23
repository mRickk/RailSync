<template>
    <div class="form-container">
      <slot></slot>
    </div>
  </template>
  
  <script setup lang="ts">
  // No additional logic is required for this container
  </script>
  
  <style scoped>
  .form-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background-color: #f8f9fa; /* Light gray background */
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    margin: 0 auto;
  }
  </style>