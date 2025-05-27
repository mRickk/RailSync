<template>
  <div class="mb-3 position-relative" style="max-width: 400px;">
    <input
      type="text"
      class="form-control"
      placeholder="Search station"
      v-model="query"
      @input="onInputHandler"
      @blur="onBlur"
      autocomplete="off"
      :class="{ 'is-invalid': invalid }"
      role="combobox"
      aria-autocomplete="list"
      aria-controls="suggestions-list"
      aria-expanded="isOpen"
      aria-haspopup="listbox"
    />

    <ul
      v-if="isOpen && filteredSuggestions.length"
      id="suggestions-list"
      class="list-group position-absolute w-100"
      style="z-index: 1000; max-height: 200px; overflow-y: auto;"
      role="listbox"
    >
      <li
        v-for="(item, index) in filteredSuggestions"
        :key="item.id"
        class="list-group-item list-group-item-action"
        role="option"
        @mousedown.prevent="selectSuggestion(item)"
      >
        {{ item.displayName }}
      </li>
    </ul>

    <div v-if="invalid" class="invalid-feedback">
      Select a valid station from the list.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { get_stations } from '@/api/stations'

const props = defineProps({
  modelValue: String // è l'id della stazione
})

const emit = defineEmits(['update:modelValue'])

const query = ref('') // quello che l'utente vede (displayName)
const filteredSuggestions = ref([])
const isOpen = ref(false)
const invalid = ref(false)
let debounceTimeout = null
let justSelected = false;
let previousDisplayName = null;

async function onInputHandler() {
  justSelected = false
  invalid.value = false

  if (query.value.trim().length < 1) {
    filteredSuggestions.value = []
    isOpen.value = false
    emit('update:modelValue', '') // reset id se input svuotato
    return
  }

  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(async () => {
    try {
      const results = await get_stations(query.value)
      filteredSuggestions.value = results.slice(0, 10)
      isOpen.value = filteredSuggestions.value.length > 0
    } catch (error) {
      console.error('Errore fetch stazioni:', error)
      filteredSuggestions.value = []
      isOpen.value = false
    }
  }, 300)
}

function selectSuggestion(station) {
  query.value = station.displayName
  previousDisplayName = station.displayName
  isOpen.value = false
  invalid.value = false
  justSelected = true
  emit('update:modelValue', String(station.id))
}

function onBlur() {
  if(justSelected) {
    const match = filteredSuggestions.value.find(
      s => s.displayName === query.value
    )
    if (!match) {
      query.value = ''
      invalid.value = true
      emit('update:modelValue', '')
    }
    isOpen.value = false
  } else {
    justSelected = true
    const match = filteredSuggestions.value.find(
      s => s.displayName === query.value
    )
    invalid.value = false
    if (!match) {
      query.value = previousDisplayName
    } else {
      previousDisplayName = query.value
      emit('update:modelValue', String(match.id))
    }
    isOpen.value = false
  }

}
</script>

<style scoped>
.list-group-item:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}
</style>
