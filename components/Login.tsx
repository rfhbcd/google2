import React, { useState } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import { User } from '../types';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { state, dispatch } = useKanbanStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const user = state.data.users.find(
        (u: User) => 
          (u.name.toLowerCase() === username.toLowerCase() || u.email?.toLowerCase() === username.toLowerCase()) &&
          u.password === password
      );
      
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        setError('Usuário ou senha inválidos.');
      }
      setLoading(false);
    }, 500); // Simula uma pequena latência de rede
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
              Usuário (ou E-mail)
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: ana ou ana@kanban.app"
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
            disabled={loading}
            className="w-full py-2 text-white transition duration-150 bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
         <div className="p-4 mt-4 text-sm text-center border rounded-lg bg-slate-50 border-slate-200">
            <h4 className="font-semibold">Usuários de Demonstração</h4>
            <ul className="mt-2 text-slate-600">
                <li><b className="font-medium">Admin:</b> ana (senha: ana)</li>
                <li><b className="font-medium">Membro:</b> bruno (senha: bruno)</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;