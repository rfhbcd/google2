import React, { useMemo } from 'react';
import { useKanbanStore } from '../hooks/useKanbanStore';
import { Task, User } from '../types';

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

const isOverdue = (task: Task) => new Date(task.dueDate) < new Date() && task.status !== 'done';

const OverdueReport: React.FC = () => {
    const { state } = useKanbanStore();
    const { users, tasks } = state.data;

    const reportData = useMemo(() => {
        // Fix: Explicitly type the 'task' parameter to resolve TypeScript error.
        const completedTasks = Object.values(tasks).filter(
            (task: Task) => task.completionDate
        );

        const overdueTasks = completedTasks.filter(
            task => new Date(task.completionDate!) > new Date(task.dueDate)
        );

        const now = new Date();
        const daysBetween = (date1: Date, date2: Date) => {
            return Math.ceil(Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
        }

        return users.map(user => {
            const userOverdueTasks = overdueTasks.filter(task => task.assigneeIds.includes(user.id));
            const periods = {
                '7': 0, '15': 0, '30': 0, '90': 0
            };

            userOverdueTasks.forEach(task => {
                const daysAgo = daysBetween(now, new Date(task.completionDate!));
                if (daysAgo <= 7) periods['7']++;
                if (daysAgo <= 15) periods['15']++;
                if (daysAgo <= 30) periods['30']++;
                if (daysAgo <= 90) periods['90']++;
            });
            return { user, periods, totalOverdue: userOverdueTasks.length };
        }).sort((a, b) => b.totalOverdue - a.totalOverdue);

    }, [users, tasks]);

    return (
        <div className="p-6 mt-8 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Relatório de Entregas Atrasadas</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Membro da Equipe</th>
                            <th scope="col" className="px-6 py-3 text-center">Últimos 7 dias</th>
                            <th scope="col" className="px-6 py-3 text-center">Últimos 15 dias</th>
                            <th scope="col" className="px-6 py-3 text-center">Últimos 30 dias</th>
                            <th scope="col" className="px-6 py-3 text-center">Últimos 90 dias</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map(({ user, periods }) => (
                            <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
                                <th scope="row" className="flex items-center gap-3 px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                    <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-indigo-800 bg-indigo-100 rounded-full">
                                      {user.avatar}
                                    </div>
                                    {user.name}
                                </th>
                                <td className="px-6 py-4 text-center">{periods['7']}</td>
                                <td className="px-6 py-4 text-center">{periods['15']}</td>
                                <td className="px-6 py-4 text-center">{periods['30']}</td>
                                <td className="px-6 py-4 text-center">{periods['90']}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
  const { state } = useKanbanStore();
  const { users, tasks } = state.data;

  const userSummaries = useMemo<UserTaskSummary[]>(() => {
    return users.map(user => {
      const userTasks = Object.values(tasks).filter((task: Task) => task.assigneeIds.includes(user.id));
      
      return {
        user,
        tasks: userTasks,
        counts: {
          total: userTasks.length,
          // Fix: Explicitly type the 't' parameter to resolve TypeScript error.
          todo: userTasks.filter((t: Task) => t.status === 'todo').length,
          // Fix: Explicitly type the 't' parameter to resolve TypeScript error.
          inProgress: userTasks.filter((t: Task) => t.status === 'inprogress').length,
          // Fix: Explicitly type the 't' parameter to resolve TypeScript error.
          done: userTasks.filter((t: Task) => t.status === 'done').length,
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
      <OverdueReport />
    </div>
  );
};

export default Dashboard;