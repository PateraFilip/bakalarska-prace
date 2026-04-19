<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const todos = ref([]);
const inputValue = ref('');
const filter = ref('all');

onMounted(() => {
  const saved = localStorage.getItem('vue-todos');
  if (saved) {
    todos.value = JSON.parse(saved);
  }
});

watch(todos, (newVal) => {
  localStorage.setItem('vue-todos', JSON.stringify(newVal));
}, { deep: true });

const addTodo = () => {
  if (!inputValue.value.trim()) return;

  todos.value.unshift({
    id: Date.now(),
    text: inputValue.value.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  });

  inputValue.value = '';
};

const deleteTodo = (id) => {
  todos.value = todos.value.filter(t => t.id !== id);
};

const clearCompleted = () => {
  if (confirm('Smazat všechny dokončené úkoly?')) {
    todos.value = todos.value.filter(t => !t.completed);
  }
};

const filteredTodos = computed(() => {
  if (filter.value === 'active') return todos.value.filter(t => !t.completed);
  if (filter.value === 'completed') return todos.value.filter(t => t.completed);
  return todos.value;
});

const activeCount = computed(() => todos.value.filter(t => !t.completed).length);
const completedCount = computed(() => todos.value.length - activeCount.value);
</script>

<template>
  <div class="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans selection:bg-green-500/30">

    <div class="bg-gray-900/50 p-8 rounded-[40px] border border-gray-800 backdrop-blur-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

      <h1 class="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8 uppercase tracking-tighter italic">
          Vue Todo
      </h1>

      <form @submit.prevent="addTodo" class="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Co je třeba udělat?"
            v-model="inputValue"
            class="flex-1 bg-black/40 border border-gray-700 rounded-2xl p-4 text-white placeholder-gray-500 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition shadow-inner"
          />
          <button type="submit"
                  class="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-900/20 transition transform active:scale-95">
              Přidat
          </button>
      </form>

      <div class="flex bg-gray-900 rounded-2xl p-1 border border-gray-800 mb-6 shrink-0">
          <button
            v-for="f in ['all', 'active', 'completed']"
            :key="f"
            @click="filter = f"
            class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            :class="filter === f ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'"
          >
            {{ f === 'all' ? 'Vše' : f === 'active' ? 'Aktivní' : 'Hotové' }}
          </button>
      </div>

      <div class="flex flex-col gap-3 overflow-y-auto pr-2 pb-2 custom-scrollbar">

        <TransitionGroup name="list">
          <div
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="group flex items-center gap-4 p-4 bg-gray-900/40 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all"
            :class="{ 'opacity-50': todo.completed }"
          >

              <button
                @click="todo.completed = !todo.completed"
                class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                :class="todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-green-500'"
              >
                <svg v-if="todo.completed" class="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              </button>

              <span
                @click="todo.completed = !todo.completed"
                class="flex-1 text-sm font-medium cursor-pointer select-none"
                :class="todo.completed ? 'line-through text-gray-500' : 'text-gray-200'"
              >
                  {{ todo.text }}
              </span>

              <button
                @click="deleteTodo(todo.id)"
                class="text-gray-600 hover:text-red-500 p-2 rounded-lg hover:bg-red-900/20 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Smazat"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
              </button>
          </div>
        </TransitionGroup>

        <div v-if="filteredTodos.length === 0" class="flex flex-col items-center justify-center py-12 opacity-50">
            <p class="font-bold text-sm uppercase tracking-widest text-gray-500">Žádné úkoly v seznamu</p>
        </div>

      </div>

      <div class="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <span>
            {{ activeCount }} {{ activeCount === 1 ? 'úkol zbývá' : (activeCount >= 2 && activeCount <= 4 ? 'úkoly zbývají' : 'úkolů zbývá') }}
          </span>

          <button
            v-if="completedCount > 0"
            @click="clearCompleted"
            class="hover:text-red-500 transition"
          >
            Smazat hotové
          </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}
</style>