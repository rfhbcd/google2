import React, { useState, useMemo } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import Column from './Column';
import { ColumnId, Task } from '../types';

const KanbanBoard: React.FC = () => {
  const { state, dispatch } = useKanbanStore();
  const { data, filters } = state;
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  const handleTaskDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/kanban.task.id', taskId);
    document.body.classList.add('dragging');
  };

  const handleTaskDragEnd = () => {
    setDraggedTaskId(null);
    document.body.classList.remove('dragging');
  };

  const handleTaskDrop = (e: React.DragEvent<HTMLDivElement>, destColumnId: ColumnId, destIndex: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('application/kanban.task.id');
    if (!taskId) return;

    const sourceTask = data.tasks[taskId];
    if (!sourceTask) return;

    const sourceColumnId = sourceTask.status;

    if (sourceColumnId !== destColumnId || data.columns[sourceColumnId].taskIds.indexOf(taskId) !== destIndex) {
        dispatch({ type: 'MOVE_TASK', payload: { taskId, sourceColumnId, destColumnId, destIndex } });
    }
  };

  const handleColumnDragStart = (e: React.DragEvent<HTMLDivElement>, columnId: ColumnId) => {
    setDraggedColumnId(columnId);
    e.dataTransfer.setData('application/kanban.column.id', columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedColumnId(null);
  };

  const handleColumnDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: ColumnId) => {
    e.preventDefault();
    const sourceColumnId = e.dataTransfer.getData('application/kanban.column.id');
    
    if (!sourceColumnId || sourceColumnId === targetColumnId) return;

    const sourceIndex = data.columnOrder.findIndex(id => id === sourceColumnId);
    const destinationIndex = data.columnOrder.findIndex(id => id === targetColumnId);

    if (sourceIndex === -1 || destinationIndex === -1) return;

    dispatch({ type: 'REORDER_COLUMN', payload: { sourceIndex, destinationIndex } });
  };
  
  const filteredTasks = useMemo(() => {
    return Object.values(data.tasks).filter((task: Task) => {
      const assigneeMatch = !filters.assigneeId || task.assigneeIds.includes(filters.assigneeId);
      const priorityMatch = !filters.priority || task.priority === filters.priority;
      return assigneeMatch && priorityMatch;
    // Fix: Explicitly type the 'task' parameter to resolve TypeScript error.
    }).map((task: Task) => task.id);
  }, [data.tasks, filters]);


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full auto-cols-fr" style={{gridTemplateColumns: `repeat(${data.columnOrder.length}, minmax(300px, 1fr))`}}>
      {data.columnOrder.map((columnId) => {
        const column = data.columns[columnId];
        const tasks = column.taskIds
            .filter(taskId => filteredTasks.includes(taskId))
            .map(taskId => data.tasks[taskId]);

        return (
          <Column
            key={column.id}
            column={column}
            tasks={tasks}
            isDragging={draggedColumnId === column.id}
            onTaskDragStart={handleTaskDragStart}
            onTaskDragEnd={handleTaskDragEnd}
            onTaskDrop={handleTaskDrop}
            onColumnDragStart={handleColumnDragStart}
            onColumnDragEnd={handleColumnDragEnd}
            onColumnDrop={handleColumnDrop}
          />
        );
      })}
    </div>
  );
};

export default KanbanBoard;