import React from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import { Priority } from '../types';
import { FilterIcon } from './icons/FilterIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface HeaderProps {
  currentView: 'board' | 'dashboard' | 'admin';
  setCurrentView: (view: 'board' | 'dashboard' | 'admin') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { state, dispatch } = useKanbanStore();
  const { loggedInUser, data, filters } = state;

  const handleFilterChange = (filterType: 'assigneeId' | 'priority', value: string | null) => {
    dispatch({ type: 'SET_FILTER', payload: { filterType, value } });
  };

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
  };

  const NavButton: React.FC<{ view: 'board' | 'dashboard' | 'admin'; label: string }> = ({ view, label }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`px-3 py-2 text-sm font-medium rounded-md ${
        currentView === view ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-indigo-600">KanbanPro</h1>
          <nav className="flex items-center gap-2">
            <NavButton view="board" label="Quadro" />
            <NavButton view="dashboard" label="Dashboard" />
            {loggedInUser?.isAdmin && <NavButton view="admin" label="Admin" />}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {currentView === 'board' && (
            <div className="flex items-center gap-4">
               <div className="relative">
                 <FilterIcon className="absolute w-5 h-5 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                 <select
                    value={filters.assigneeId || ''}
                    onChange={(e) => handleFilterChange('assigneeId', e.target.value || null)}
                    className="py-2 pl-10 pr-4 text-sm bg-white border rounded-md appearance-none border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Todos os Membros</option>
                    {data.users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
               </div>
               <div className="relative">
                 <FilterIcon className="absolute w-5 h-5 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                 <select
                    value={filters.priority || ''}
                    onChange={(e) => handleFilterChange('priority', e.target.value || null)}
                    className="py-2 pl-10 pr-4 text-sm bg-white border rounded-md appearance-none border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Todas as Prioridades</option>
                    {Object.values(Priority).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
               </div>
               <button onClick={() => dispatch({ type: 'CLEAR_FILTERS' })} className="text-sm text-slate-500 hover:text-indigo-600">Limpar Filtros</button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 text-lg font-bold text-indigo-800 bg-indigo-100 rounded-full">
              {loggedInUser?.avatar}
            </div>
            <div className="text-sm">
              <p className="font-semibold">{loggedInUser?.name}</p>
              <button onClick={handleLogout} className="text-slate-500 hover:text-indigo-600">Sair</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
