
import React, { useState } from 'react';
import { Task } from '../types';
import { useKanbanStore } from '../hooks/useKanbanStore';
import Modal from './Modal';
import TaskForm from './TaskForm';
import { ClockIcon } from './icons/ClockIcon';
import { FlagIcon } from './icons/FlagIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnd: () => void;
}

const getUrgencyStyles = (dueDate: string): { badge: string; border: string; text: string; daysLeft: number | null } => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffTime < 0) {
    return { badge: 'bg-red-100 text-red-800', border: 'border-l-4 border-red-500', text: 'text-red-600', daysLeft: diffDays };
  }
  if (diffDays <= 2) {
    return { badge: 'bg-yellow-100 text-yellow-800', border: 'border-l-4 border-yellow-500', text: 'text-yellow-600', daysLeft: diffDays };
  }
  return { badge: 'bg-green-100 text-green-800', border: 'border-l-4 border-green-500', text: 'text-slate-500', daysLeft: diffDays };
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onDragEnd }) => {
  const { state, dispatch } = useKanbanStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const assignees = task.assigneeIds.map(id => state.data.users.find(u => u.id === id)).filter(Boolean);

  const { badge, border, text, daysLeft } = getUrgencyStyles(task.dueDate);

  const formattedDueDate = new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  const priorityStyles = {
    'Alta': 'bg-red-500',
    'Média': 'bg-yellow-500',
    'Baixa': 'bg-blue-500',
  };

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) {
      dispatch({ type: 'DELETE_TASK', payload: { taskId: task.id } });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData('application/kanban.task.id', task.id);
    onDragStart(e, task.id);
  }

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  }

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        data-task-id={task.id}
        className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-lg transition-shadow ${border} ${isDragging ? 'opacity-50 task-card-drag-indicator' : ''}`}
      >
        <div className="flex items-start justify-between">
          <p className="font-semibold text-slate-800 break-words">{task.title}</p>
          <div className="flex-shrink-0 flex items-center gap-2">
            <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-indigo-600"><EditIcon className="w-4 h-4" /></button>
            <button onClick={handleDelete} className="text-slate-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2">{task.description}</p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm" title={`Prioridade: ${task.priority}`}>
              <FlagIcon className="w-4 h-4 text-slate-400" />
              <span className={`w-3 h-3 rounded-full ${priorityStyles[task.priority]}`}></span>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full ${badge}`} title={`Prazo: ${formattedDueDate}`}>
              <ClockIcon className="w-4 h-4" />
              <span>
                {daysLeft !== null && daysLeft < 0 ? `Atrasado ${Math.abs(daysLeft)}d` :
                 daysLeft !== null && daysLeft <= 2 ? `Vence em ${daysLeft}d` : formattedDueDate}
              </span>
            </div>
          </div>
          
          <div className="flex -space-x-2">
            {assignees.map(user => user && (
              <div key={user.id} title={user.name} className="flex items-center justify-center w-8 h-8 text-sm font-bold text-indigo-800 bg-indigo-200 border-2 border-white rounded-full">
                {user.avatar}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
        <TaskForm taskToEdit={task} onClose={() => setIsEditing(false)} />
      </Modal>
    </>
  );
};

export default TaskCard;