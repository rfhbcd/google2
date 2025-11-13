
import React, { useState } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';

const Login: React.FC = () => {
  const { state, dispatch } = useKanbanStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Username can be the full name or the first name.
    const userToLogin = state.data.users.find(user => 
        (user.name.toLowerCase() === username.toLowerCase() || 
         user.name.split(' ')[0].toLowerCase() === username.toLowerCase()) && 
        user.password === password
    );

    if (userToLogin) {
      dispatch({ type: 'LOGIN', payload: userToLogin });
      setError('');
    } else {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-slate-800">
          Kanban Login
        </h1>
        <p className="text-center text-slate-500">Bem-vindo de volta!</p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-700"
            >
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Ana Silva ou ana"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Senha"
              required
            />
          </div>
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 text-white transition duration-150 bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;