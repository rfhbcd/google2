import React, { useMemo } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import { Task, User, ColumnId } from '../types';

interface UserTaskSummary {
  user: User;
  tasks: Task[];
  counts: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    overdue: number;
  };
}

const isOverdue = (task: Task) => new Date(task.dueDate) < new Date() && task.status !== ColumnId.Done;

const Dashboard: React.FC = () => {
  const { state } = useKanbanStore();
  const { users, tasks } = state.data;

  const userSummaries = useMemo<UserTaskSummary[]>(() => {
    return users.map(user => {
      // FIX: Add explicit type 'Task' to the `task` parameter in the filter function.
      // This ensures `userTasks` is an array of `Task`s, preventing downstream
      // errors when accessing task properties.
      const userTasks = Object.values(tasks).filter((task: Task) => task.assigneeIds.includes(user.id));
      
      return {
        user,
        tasks: userTasks,
        counts: {
          total: userTasks.length,
          todo: userTasks.filter(t => t.status === ColumnId.ToDo).length,
          inProgress: userTasks.filter(t => t.status === ColumnId.InProgress).length,
          done: userTasks.filter(t => t.status === ColumnId.Done).length,
          overdue: userTasks.filter(isOverdue).length,
        },
      };
    });
  }, [users, tasks]);

  return (
    <div className="container mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-slate-800">Dashboard da Equipe</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userSummaries.map(({ user, counts }) => (
          <div key={user.id} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 text-xl font-bold text-indigo-800 bg-indigo-100 rounded-full">
                {user.avatar}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-sm text-slate-500">{counts.total} tarefa(s) atribuída(s)</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 text-center bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-700">{counts.todo}</p>
                    <p className="text-slate-500">A Fazer</p>
                </div>
                 <div className="p-3 text-center bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-700">{counts.inProgress}</p>
                    <p className="text-slate-500">Em Progresso</p>
                </div>
                 <div className="p-3 text-center bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-700">{counts.done}</p>
                    <p className="text-slate-500">Concluídas</p>
                </div>
                <div className={`p-3 text-center rounded-lg ${counts.overdue > 0 ? 'bg-red-100' : 'bg-slate-50'}`}>
                    <p className={`text-2xl font-bold ${counts.overdue > 0 ? 'text-red-600' : 'text-slate-700'}`}>{counts.overdue}</p>
                    <p className={`${counts.overdue > 0 ? 'text-red-500' : 'text-slate-500'}`}>Atrasadas</p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;