<script setup lang="ts">
import ValidatingInput from './ValidatingInput.vue';

const props = defineProps<{
    type: string,
    id: string,
    dontAutocapitalize?: boolean,
    validationFunction?: (value: string) => boolean,
    disabled?: boolean,
}>();

const defaultValidationFunction = (value: string) => true;
const validationFunction = props.validationFunction || defaultValidationFunction;

// Define the model for two-way binding
const model = defineModel<string>();
</script>

<template>
    <ValidatingInput 
        :dont-autocapitalize="dontAutocapitalize" 
        :id="id" 
        :type="type" 
        :error-message="'Invalid input'"
        :validation-function="validationFunction" 
        :disabled="disabled"
        v-model="model"
    >
        <slot></slot>
    </ValidatingInput>
</template>