<template>
    <div class="mb-3 position-relative" style="max-width: 400px;">
      <input
        type="text"
        class="form-control"
        placeholder="Inserisci stazione"
        v-model="query"
        @input="onInput"
        @blur="onBlur"
        autocomplete="off"
        aria-autocomplete="list"
        aria-controls="suggestions-list"
        aria-expanded="isOpen"
        aria-haspopup="listbox"
        role="combobox"
        :class="{ 'is-invalid': invalid }"
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
          :key="index"
          class="list-group-item list-group-item-action"
          role="option"
          @mousedown.prevent="selectSuggestion(item)"
        >
          {{ item }}
        </li>
      </ul>
      <div v-if="invalid" class="invalid-feedback">
        Seleziona una stazione valida dalla lista.
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const query = ref('')
  const isOpen = ref(false)
  const invalid = ref(false)
  
  // Lista statica di 100 parole (nomi di città/stazioni esempio)
  const suggestions = [
    'Milano Centrale', 'Roma Termini', 'Torino Porta Nuova', 'Napoli Centrale', 'Firenze Santa Maria Novella',
    'Bologna Centrale', 'Venezia Santa Lucia', 'Genova Piazza Principe', 'Verona Porta Nuova', 'Padova',
    'Trieste Centrale', 'Bari Centrale', 'Palermo Centrale', 'Catania Centrale', 'Messina Centrale',
    'Parma', 'Modena', 'Reggio Emilia', 'Pisa Centrale', 'Salerno',
    'Livorno Centrale', 'Taranto', 'Bolzano', 'Trento', 'Lecce',
    'Ancona', 'Cagliari', 'Rimini', 'Arezzo', 'La Spezia',
    'Pescara', 'Udine', 'Siena', 'Perugia', 'Ravenna',
    'Lucca', 'Terni', 'Cremona', 'Como', 'Mantova',
    'Brindisi', 'Foggia', 'Grosseto', 'Imperia', 'Lodi',
    'Massa', 'Novara', 'Oristano', 'Pordenone', 'Potenza',
    'Ragusa', 'Savona', 'Vercelli', 'Viterbo', 'Aosta',
    'Belluno', 'Cosenza', 'Enna', 'Frosinone', 'Gela',
    'Isernia', 'L’Aquila', 'Macerata', 'Nuoro', 'Olbia',
    'Palmi', 'Pavia', 'Rieti', 'Sassari', 'Trapani',
    'Vibo Valentia', 'Arezzo', 'Bergamo', 'Caserta', 'Catanzaro',
    'Crotone', 'Fano', 'Faenza', 'Fidenza', 'Francavilla al Mare',
    'Iglesias', 'Marsala', 'Molfetta', 'Monza', 'Pinerolo',
    'Pistoia', 'Rimini', 'Rosarno', 'Sanremo', 'Spoleto',
    'Termoli', 'Tolmezzo', 'Treviso', 'Vasto', 'Viareggio'
  ]
  const filteredSuggestions = ref([])

function onInput() {
  invalid.value = false // reset errore mentre scrive
  const val = query.value.trim().toLowerCase()
  if (val.length < 1) {
    filteredSuggestions.value = []
    isOpen.value = false
    return
  }
  filteredSuggestions.value = suggestions.filter(item =>
    item.toLowerCase().includes(val)
  ).slice(0, 10)
  isOpen.value = filteredSuggestions.value.length > 0
}

function selectSuggestion(name) {
  query.value = name
  filteredSuggestions.value = []
  isOpen.value = false
  invalid.value = false
}

// Controllo a perdita focus: il valore deve essere uno dei suggeriti
function onBlur() {
  if (!suggestions.includes(query.value)) {
    invalid.value = true
    query.value = ''
  }
  isOpen.value = false
}
</script>

<style scoped>
.list-group-item:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}
</style>