import { useState, useEffect } from 'react'

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    if (window.confirm('Smazat všechny dokončené úkoly?')) {
      setTodos(todos.filter(todo => !todo.completed));
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.length - activeCount;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans bg-black text-white selection:bg-green-500/30">

      <div className="bg-gray-900/50 p-8 rounded-[40px] border border-gray-800 backdrop-blur-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        <h1 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8 uppercase tracking-tighter italic">
            React Todo
        </h1>

        <form onSubmit={addTodo} className="flex gap-4 mb-8">
            <input
              type="text"
              placeholder="Co je třeba udělat?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-black/40 border border-gray-700 rounded-2xl p-4 text-white placeholder-gray-500 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition shadow-inner"
            />
            <button type="submit"
                    className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-900/20 transition transform active:scale-95">
                Přidat
            </button>
        </form>

        <div className="flex bg-gray-900 rounded-2xl p-1 border border-gray-800 mb-6 shrink-0">
            {['all', 'active', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f
                    ? 'bg-gray-800 text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f === 'all' ? 'Vše' : f === 'active' ? 'Aktivní' : 'Hotové'}
              </button>
            ))}
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-2 custom-scrollbar">
            {filteredTodos.length > 0 ? (
              filteredTodos.map(todo => (
                <div key={todo.id} className={`group flex items-center gap-4 p-4 bg-gray-900/40 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all ${todo.completed ? 'opacity-50' : ''}`}>

                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-green-500'
                      }`}
                    >
                      {todo.completed && (
                        <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7"/>
                        </svg>
                      )}
                    </button>

                    <span
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex-1 text-sm font-medium cursor-pointer select-none ${todo.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}
                    >
                        {todo.text}
                    </span>

                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-600 hover:text-red-500 p-2 rounded-lg hover:bg-red-900/20 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Smazat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 opacity-50">
                  <p className="font-bold text-sm uppercase tracking-widest text-gray-500">Žádné úkoly v seznamu</p>
              </div>
            )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <span>
              {activeCount} {activeCount === 1 ? 'úkol zbývá' : (activeCount >= 2 && activeCount <= 4 ? 'úkoly zbývají' : 'úkolů zbývá')}
            </span>

            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="hover:text-red-500 transition"
              >
                Smazat hotové
              </button>
            )}
        </div>

      </div>
    </div>
  )
}

export default App