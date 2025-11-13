import { KanbanData, Priority } from './types';

export const initialData: KanbanData = {
  users: [
    { id: 'user-1', name: 'Ana', avatar: 'A', email: 'ana@kanban.app', password: 'ana', isAdmin: true },
    { id: 'user-2', name: 'Bruno', avatar: 'B', email: 'bruno@kanban.app', password: 'bruno', isAdmin: false },
    { id: 'user-3', name: 'Carla', avatar: 'C', email: 'carla@kanban.app', password: 'carla', isAdmin: false },
    { id: 'user-4', name: 'Daniel', avatar: 'D', email: 'daniel@kanban.app', password: 'daniel', isAdmin: false },
  ],
  tasks: {
    'task-1': { id: 'task-1', title: 'Configurar o ambiente de desenvolvimento', description: 'Instalar Node, React e Tailwind.', assigneeIds: ['user-1'], dueDate: '2024-08-10T23:59:59.000Z', priority: Priority.Alta, status: 'todo' },
    'task-2': { id: 'task-2', title: 'Desenvolver a estrutura de componentes', description: 'Criar componentes reutilizáveis para o quadro, colunas e cards.', assigneeIds: ['user-2'], dueDate: '2024-08-12T23:59:59.000Z', priority: Priority.Media, status: 'inprogress' },
    'task-3': { id: 'task-3', title: 'Implementar a funcionalidade de arrastar e soltar', description: 'Usar uma biblioteca como react-beautiful-dnd.', assigneeIds: ['user-3'], dueDate: '2024-08-15T23:59:59.000Z', priority: Priority.Alta, status: 'inprogress' },
    'task-4': { id: 'task-4', title: 'Criar o modal de edição de tarefas', description: 'Permitir que os usuários editem os detalhes da tarefa.', assigneeIds: ['user-1'], dueDate: '2024-08-11T23:59:59.000Z', priority: Priority.Media, status: 'review' },
    'task-5': { id: 'task-5', title: 'Desenvolver o painel de administração', description: 'Adicionar funcionalidade para gerenciar usuários e colunas.', assigneeIds: ['user-1'], dueDate: '2024-08-20T23:59:59.000Z', priority: Priority.Alta, status: 'todo' },
    'task-6': { id: 'task-6', title: 'Testar a responsividade', description: 'Garantir que o layout funcione em dispositivos móveis.', assigneeIds: ['user-4'], dueDate: '2024-07-30T23:59:59.000Z', priority: Priority.Baixa, status: 'done', completionDate: '2024-07-29T10:00:00.000Z' },
    'task-7': { id: 'task-7', title: 'Corrigir bug na autenticação', description: 'O logout não está redirecionando corretamente.', assigneeIds: ['user-2'], dueDate: '2024-08-01T23:59:59.000Z', priority: Priority.Alta, status: 'done', completionDate: '2024-08-02T14:30:00.000Z' },
  },
  columns: {
    'todo': { id: 'todo', title: 'A Fazer', taskIds: ['task-1', 'task-5'] },
    'inprogress': { id: 'inprogress', title: 'Em Progresso', taskIds: ['task-2', 'task-3'] },
    'review': { id: 'review', title: 'Revisão', taskIds: ['task-4'] },
    'done': { id: 'done', title: 'Concluído', taskIds: ['task-6', 'task-7'] },
  },
  columnOrder: ['todo', 'inprogress', 'review', 'done'],
};
