<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    validationFunction: (value: string) => boolean,
    errorMessage: string,
    type: string,
    id: string,
    dontAutocapitalize?: boolean,
}>();

const model = defineModel<string>(); // For the input value
const validationModel = defineModel<boolean>("valid"); // For the validation status

// Computed property to determine if the field is valid
const fieldValid = computed(() => {
    const isValid = props.validationFunction(model?.value || ""); // Fallback to an empty string
    validationModel.value = isValid; // Update the validation model
    return isValid;
});
</script>

<template>
    <div class="mb-3">
        <!-- Label for the input -->
        <label class="form-label" :for="id">
            <slot></slot>
        </label>

        <!-- Input field with dynamic classes for validation -->
        <input 
            ref="input" 
            :aria-invalid="!fieldValid" 
            required 
            aria-required="true"
            :class="`form-control ${model?.length > 0 && props.errorMessage.length > 0 ? (fieldValid ? 'is-valid' : 'is-invalid') : ''}`"
            :type="type" 
            :id="id" 
            v-model="model" 
            :autocapitalize="dontAutocapitalize ? 'none' : 'yes'"
        />

        <!-- Error message for invalid input -->
        <div v-if="!fieldValid && props.errorMessage" class="invalid-feedback">
            {{ props.errorMessage }}
        </div>
    </div>
</template>