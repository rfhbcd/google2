
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

  const handleFilterChange = (filterType: 'assigneeId' | 'priority', value: string) => {
    dispatch({ type: 'SET_FILTER', payload: { filterType, value: value || null } });
  };
  
  const handleClearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  if (!loggedInUser) return null;

  return (
    <header className="flex-shrink-0 bg-white shadow-md z-10">
      <div className="container px-4 py-3 mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-indigo-600">KanbanFlow</h1>
            <nav className="flex items-center gap-2">
                <button onClick={() => setCurrentView('board')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${currentView === 'board' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>Quadro</button>
                <button onClick={() => setCurrentView('dashboard')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${currentView === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>Dashboard</button>
                {loggedInUser.isAdmin && <button onClick={() => setCurrentView('admin')} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${currentView === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>Admin</button>}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {currentView === 'board' && (
              <div className="flex items-center gap-2">
                <FilterIcon className="w-5 h-5 text-slate-500" />
                <select 
                  value={filters.assigneeId || ''}
                  onChange={(e) => handleFilterChange('assigneeId', e.target.value)}
                  className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Todos os Responsáveis</option>
                  {data.users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
                <select 
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Todas as Prioridades</option>
                  {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                 {(filters.assigneeId || filters.priority) && 
                    <button onClick={handleClearFilters} className="text-sm text-indigo-600 hover:underline">Limpar</button>
                 }
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold text-slate-800">{loggedInUser.name}</p>
                <button onClick={() => dispatch({ type: 'LOGOUT' })} className="text-xs text-slate-500 hover:text-indigo-600">Sair</button>
              </div>
              <div className="flex items-center justify-center w-10 h-10 text-indigo-600 bg-indigo-100 rounded-full font-bold">
                {loggedInUser.avatar}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
