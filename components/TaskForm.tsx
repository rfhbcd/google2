
import React, { useState } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import { Task, Priority, ColumnId } from '../types';

interface TaskFormProps {
  onClose: () => void;
  taskToEdit?: Task;
  columnId?: ColumnId;
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, taskToEdit, columnId }) => {
  const { state, dispatch } = useKanbanStore();
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [assigneeIds, setAssigneeIds] = useState<string[]>(taskToEdit?.assigneeIds || []);
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
  const [priority, setPriority] = useState<Priority>(taskToEdit?.priority || Priority.Media);
  const [status, setStatus] = useState<ColumnId>(taskToEdit?.status || columnId || ColumnId.ToDo);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) {
      alert('Título e Prazo são obrigatórios.');
      return;
    }
    
    const taskData = {
      title,
      description,
      assigneeIds,
      dueDate: new Date(dueDate).toISOString(),
      priority,
      status,
    };

    if (taskToEdit) {
      dispatch({ type: 'UPDATE_TASK', payload: { ...taskData, id: taskToEdit.id } });
    } else {
      dispatch({ type: 'ADD_TASK', payload: taskData });
    }
    onClose();
  };
  
  const handleAssigneeChange = (userId: string) => {
    setAssigneeIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">{taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título</label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Responsáveis</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {state.data.users.map(user => (
            <label key={user.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition ${assigneeIds.includes(user.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>
              <input type="checkbox" checked={assigneeIds.includes(user.id)} onChange={() => handleAssigneeChange(user.id)} className="hidden" />
              <div className="flex items-center justify-center w-6 h-6 text-xs font-bold text-indigo-800 bg-indigo-200 rounded-full">{user.avatar}</div>
              <span>{user.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">Prazo</label>
          <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as ColumnId)} className="w-full px-3 py-2 mt-1 bg-white border rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            {state.data.columnOrder.map(colId => (
              <option key={colId} value={colId}>{state.data.columns[colId].title}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Prioridade</label>
        <div className="flex gap-4 mt-2">
          {Object.values(Priority).map(p => (
            <label key={p} className="flex items-center gap-2">
              <input type="radio" name="priority" value={p} checked={priority === p} onChange={() => setPriority(p)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300"/>
              <span>{p}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">{taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}</button>
      </div>
    </form>
  );
};

export default TaskForm;
