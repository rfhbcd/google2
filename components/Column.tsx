import React, { useState } from 'react';
import { Column as ColumnType, Task, ColumnId } from '../types';
import TaskCard from './TaskCard';
import Modal from './Modal';
import TaskForm from './TaskForm';
import { PlusIcon } from './icons/PlusIcon';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, destColumnId: ColumnId, destIndex: number) => void;
}

const Column: React.FC<ColumnProps> = ({ column, tasks, onDragStart, onDragEnd, onDrop }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const cardElements = Array.from(e.currentTarget.querySelectorAll('[data-task-id]'));
    const mouseY = e.clientY;
    
    let closestCard: Element | null = null;
    let closestOffset = Number.NEGATIVE_INFINITY;
    
    // FIX: Add an explicit type to the 'card' parameter to resolve errors when accessing its properties.
    cardElements.forEach((card: Element) => {
        const box = card.getBoundingClientRect();
        const offset = mouseY - box.top - box.height / 2;
        if (offset < 0 && offset > closestOffset) {
            closestOffset = offset;
            closestCard = card;
        }
    });

    const dropIndex = closestCard ? cardElements.indexOf(closestCard) : tasks.length;
    onDrop(e, column.id, dropIndex);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col bg-slate-100 rounded-xl shadow-sm h-full transition-colors ${isDragOver ? 'bg-indigo-50' : ''}`}
    >
      <div className="p-4 border-b border-slate-200">
        <h2 className="flex items-center justify-between text-lg font-semibold">
          {column.title}
          <span className="px-2 py-1 text-sm font-medium text-slate-500 bg-slate-200 rounded-full">
            {tasks.length}
          </span>
        </h2>
      </div>
      <div className="flex-grow p-2 overflow-y-auto space-y-3">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
         {isDragOver && <div className="h-24 bg-indigo-100 rounded-lg border-2 border-dashed border-indigo-300"></div>}
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