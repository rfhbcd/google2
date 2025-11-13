import React, { useState } from 'react';
import { Column as ColumnType, Task, ColumnId } from '../types';
import TaskCard from './TaskCard';
import Modal from './Modal';
import TaskForm from './TaskForm';
import { PlusIcon } from './icons/PlusIcon';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  isDragging: boolean;
  onTaskDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onTaskDragEnd: () => void;
  onTaskDrop: (e: React.DragEvent<HTMLDivElement>, destColumnId: ColumnId, destIndex: number) => void;
  onColumnDragStart: (e: React.DragEvent<HTMLDivElement>, columnId: ColumnId) => void;
  onColumnDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onColumnDrop: (e: React.DragEvent<HTMLDivElement>, targetColumnId: ColumnId) => void;
}

const Column: React.FC<ColumnProps> = ({ column, tasks, isDragging, onTaskDragStart, onTaskDragEnd, onTaskDrop, onColumnDragStart, onColumnDragEnd, onColumnDrop }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isTaskDragOver, setIsTaskDragOver] = useState(false);
  const [isColumnDragOver, setIsColumnDragOver] = useState(false);

  const handleTaskDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes('application/kanban.task.id')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsTaskDragOver(true);
    }
  };
  
  const handleTaskDragLeave = () => {
    setIsTaskDragOver(false);
  };

  const handleTaskDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTaskDragOver(false);
    
    const cardElements = Array.from(e.currentTarget.querySelectorAll('[data-task-id]'));
    const mouseY = e.clientY;
    
    let closestCard: Element | null = null;
    let closestOffset = Number.NEGATIVE_INFINITY;
    
    cardElements.forEach((card: Element) => {
        const box = card.getBoundingClientRect();
        const offset = mouseY - box.top - box.height / 2;
        if (offset < 0 && offset > closestOffset) {
            closestOffset = offset;
            closestCard = card;
        }
    });

    const dropIndex = closestCard ? cardElements.indexOf(closestCard) : tasks.length;
    onTaskDrop(e, column.id, dropIndex);
  }

  const handleColumnDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes('application/kanban.column.id')) {
      e.preventDefault();
      setIsColumnDragOver(true);
    }
  };

  return (
    <div
      onDrop={(e) => { onColumnDrop(e, column.id); setIsColumnDragOver(false); }}
      onDragOver={handleColumnDragOver}
      onDragLeave={() => setIsColumnDragOver(false)}
      className={`flex flex-col bg-slate-100 rounded-xl shadow-sm h-full transition-all ${isDragging ? 'opacity-50' : ''} ${isColumnDragOver ? 'ring-2 ring-indigo-400' : ''}`}
    >
      <div className="p-4 border-b border-slate-200">
        <h2 
          draggable
          onDragStart={(e) => onColumnDragStart(e, column.id)}
          onDragEnd={onColumnDragEnd}
          className="flex items-center justify-between text-lg font-semibold cursor-grab"
        >
          {column.title}
          <span className="px-2 py-1 text-sm font-medium text-slate-500 bg-slate-200 rounded-full">
            {tasks.length}
          </span>
        </h2>
      </div>
      <div 
        onDragOver={handleTaskDragOver}
        onDragLeave={handleTaskDragLeave}
        onDrop={handleTaskDrop}
        className={`flex-grow p-2 overflow-y-auto space-y-3 transition-colors ${isTaskDragOver ? 'bg-indigo-50' : ''}`}
      >
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDragStart={onTaskDragStart}
            onDragEnd={onTaskDragEnd}
          />
        ))}
         {isTaskDragOver && <div className="h-24 bg-indigo-100 rounded-lg border-2 border-dashed border-indigo-300"></div>}
      </div>
      <div className="p-4 mt-auto">
        <button
          onClick={() => setIsAddingTask(true)}
          className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 transition bg-indigo-100 rounded-md hover:bg-indigo-200"
        >
          <PlusIcon className="w-5 h-5" />
          Adicionar Tarefa
        </button>
      </div>

      <Modal isOpen={isAddingTask} onClose={() => setIsAddingTask(false)}>
        <TaskForm 
          onClose={() => setIsAddingTask(false)}
          columnId={column.id}
        />
      </Modal>
    </div>
  );
};

export default Column;