import React, { useState, useMemo } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import Column from './Column';
// FIX: Import the Task type to be used for type annotation.
import { ColumnId, Task } from '../types';

const KanbanBoard: React.FC = () => {
  const { state, dispatch } = useKanbanStore();
  const { data, filters } = state;
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    // Add a visual indicator class to the body
    document.body.classList.add('dragging');
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    document.body.classList.remove('dragging');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, destColumnId: ColumnId, destIndex: number) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const sourceTask = data.tasks[draggedTaskId];
    if (!sourceTask) return;

    const sourceColumnId = sourceTask.status;

    if (sourceColumnId !== destColumnId || data.columns[sourceColumnId].taskIds.indexOf(draggedTaskId) !== destIndex) {
        dispatch({ type: 'MOVE_TASK', payload: { taskId: draggedTaskId, sourceColumnId, destColumnId, destIndex } });
    }
  };
  
  const filteredTasks = useMemo(() => {
    // FIX: Add explicit type 'Task' to the `task` parameter to resolve the 'unknown' type error on `task.id`.
    return Object.values(data.tasks).filter((task: Task) => {
      const assigneeMatch = !filters.assigneeId || task.assigneeIds.includes(filters.assigneeId);
      const priorityMatch = !filters.priority || task.priority === filters.priority;
      return assigneeMatch && priorityMatch;
    }).map(task => task.id);
  }, [data.tasks, filters]);


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
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
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        );
      })}
    </div>
  );
};

export default KanbanBoard;