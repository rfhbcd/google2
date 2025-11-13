import React, { useState } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import { User } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';

const AdminPanel: React.FC = () => {
  const { state, dispatch } = useKanbanStore();
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isNewUserAdmin, setIsNewUserAdmin] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const { loggedInUser } = state;

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim() && newUserPassword.trim()) {
      dispatch({ type: 'ADD_USER', payload: { name: newUserName, password: newUserPassword, isAdmin: isNewUserAdmin } });
      setNewUserName('');
      setNewUserPassword('');
      setIsNewUserAdmin(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${user.name}"? Esta ação também removerá o usuário de todas as tarefas atribuídas.`)) {
      dispatch({ type: 'DELETE_USER', payload: { userId: user.id } });
    }
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if(newColumnName.trim()){
      dispatch({ type: 'ADD_COLUMN', payload: { title: newColumnName.trim() } });
      setNewColumnName('');
    }
  };

  const handleUpdateColumnTitle = (columnId: string, newTitle: string) => {
    const trimmedTitle = newTitle.trim();
    if (trimmedTitle && trimmedTitle !== state.data.columns[columnId].title) {
        dispatch({ type: 'UPDATE_COLUMN_TITLE', payload: { columnId, newTitle: trimmedTitle } });
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = state.data.columns[columnId];
    if(column.taskIds.length > 0) {
      alert("Você não pode excluir uma coluna que contém tarefas.");
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir a coluna "${column.title}"?`)) {
      dispatch({ type: 'DELETE_COLUMN', payload: { columnId } });
    }
  };

  return (
    <div className="container p-4 mx-auto max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold text-slate-800">Painel de Administração</h1>
      
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Add User Form */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Adicionar Novo Usuário</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label htmlFor="new-user-name" className="block text-sm font-medium text-slate-700">Nome do Usuário</label>
                <input
                  id="new-user-name"
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: João Pereira"
                  required
                />
              </div>
              <div>
                <label htmlFor="new-user-password" className="block text-sm font-medium text-slate-700">Senha</label>
                <input
                  id="new-user-password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="******"
                  required
                />
              </div>
              <div className="flex items-center">
                  <input
                      id="is-admin-checkbox"
                      type="checkbox"
                      checked={isNewUserAdmin}
                      onChange={(e) => setIsNewUserAdmin(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="is-admin-checkbox" className="block ml-2 text-sm text-slate-900">
                      Tornar Admin?
                  </label>
              </div>
              <button type="submit" className="w-full py-2 text-white transition duration-150 bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Adicionar Usuário
              </button>
            </form>
          </div>

          {/* User List */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Membros da Equipe ({state.data.users.length})</h2>
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {state.data.users.map(user => (
                <li key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-indigo-800 bg-indigo-100 rounded-full">
                      {user.avatar}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.isAdmin && (
                      <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                        Admin
                      </span>
                    )}
                    <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={user.id === loggedInUser?.id}
                        className="p-1 text-slate-400 rounded-md hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        title={user.id === loggedInUser?.id ? "Você não pode excluir a si mesmo" : "Excluir usuário"}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Manage Columns Section */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Gerenciar Colunas</h2>
            {/* Add Column Form */}
            <form onSubmit={handleAddColumn} className="flex gap-4 mb-6">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Nome da nova coluna"
                className="flex-grow px-3 py-2 border rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <button type="submit" className="flex items-center gap-2 px-4 py-2 text-white transition duration-150 bg-indigo-600 rounded-md hover:bg-indigo-700">
                <PlusIcon className="w-5 h-5" /> Adicionar
              </button>
            </form>

            {/* Column List */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-slate-600">Colunas Atuais</h3>
              {state.data.columnOrder.map(columnId => {
                const column = state.data.columns[columnId];
                const isDeletable = column.taskIds.length === 0;
                return (
                  <div key={column.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <input
                      type="text"
                      defaultValue={column.title}
                      onBlur={(e) => handleUpdateColumnTitle(column.id, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                      className="w-full px-2 py-1 mr-4 font-medium bg-transparent border border-transparent rounded-md focus:bg-white focus:border-slate-300"
                    />
                    <button
                      onClick={() => handleDeleteColumn(column.id)}
                      disabled={!isDeletable}
                      className="p-1 text-slate-400 rounded-md hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
                      title={isDeletable ? "Excluir coluna" : "Apenas colunas vazias podem ser excluídas"}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;