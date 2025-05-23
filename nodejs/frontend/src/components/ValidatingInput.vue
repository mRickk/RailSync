<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
    validationFunction: (value: string) => boolean,
    errorMessage: string,
    type: string,
    id: string,
    dontAutocapitalize?: boolean,
    disabled?: boolean,
    required?: boolean,
}>();

const model = defineModel<string>();
const validationModel = defineModel<boolean>("valid");

const touched = ref(false);

// Computed property to determine if the field is valid
const fieldValid = computed(() => {
    const isValid = props.validationFunction(model?.value || "");
    validationModel.value = isValid;
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
            :required="props.required !== false"
            :aria-required="props.required !== false"
            required 
            aria-required="true"
            :class="`form-control ${model?.length > 0 && props.errorMessage.length > 0 ? (fieldValid ? 'is-valid' : 'is-invalid') : ''}`"
            :type="type" 
            :id="id" 
            v-model="model" 
            :autocapitalize="dontAutocapitalize ? 'none' : 'yes'"
            :disabled="props.disabled"
            @blur="touched = true"
        />

        <!-- Error message for invalid input -->
        <div v-if="touched && !fieldValid && props.errorMessage" class="invalid-feedback">
            <small class="text-danger ms-2">{{ props.errorMessage }}</small>
        </div>
    </div>
</template>