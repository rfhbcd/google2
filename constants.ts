
import { KanbanData, ColumnId, Priority, User } from './types';

export const USERS: User[] = [
  { id: 'user-1', name: 'Ana Silva', password: 'ana', avatar: 'AS', isAdmin: true },
  { id: 'user-2', name: 'Bruno Costa', password: 'bruno', avatar: 'BC' },
  { id: 'user-3', name: 'Carla Dias', password: 'carla', avatar: 'CD' },
  { id: 'user-4', name: 'Daniel Alves', password: 'daniel', avatar: 'DA' },
];

export const INITIAL_DATA: KanbanData = {
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Configurar ambiente de desenvolvimento',
      description: 'Instalar todas as dependências e configurar o linter.',
      assigneeIds: ['user-1'],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
      priority: Priority.Alta,
      status: ColumnId.ToDo,
    },
    'task-2': {
      id: 'task-2',
      title: 'Desenvolver componente de Login',
      description: 'Criar a interface e a lógica de autenticação.',
      assigneeIds: ['user-2'],
      dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
      priority: Priority.Alta,
      status: ColumnId.InProgress,
    },
    'task-3': {
      id: 'task-3',
      title: 'Criar cards de tarefas',
      description: 'Implementar o componente de card com drag-and-drop.',
      assigneeIds: ['user-3', 'user-4'],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
      priority: Priority.Media,
      status: ColumnId.InProgress,
    },
    'task-4': {
      id: 'task-4',
      title: 'Revisar documentação da API',
      description: 'Verificar os endpoints necessários para a aplicação.',
      assigneeIds: [],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
      priority: Priority.Baixa,
      status: ColumnId.ToDo,
    },
    'task-5': {
      id: 'task-5',
      title: 'Deploy da versão alpha',
      description: 'Publicar a primeira versão em ambiente de staging.',
      assigneeIds: ['user-1'],
      dueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      priority: Priority.Alta,
      status: ColumnId.Done,
    },
    'task-6': {
      id: 'task-6',
      title: 'Testes de usabilidade',
      description: 'Conduzir testes com usuários para coletar feedback.',
      assigneeIds: ['user-4'],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
      priority: Priority.Media,
      status: ColumnId.ToDo,
    }
  },
  columns: {
    [ColumnId.ToDo]: {
      id: ColumnId.ToDo,
      title: 'A Fazer',
      taskIds: ['task-1', 'task-4', 'task-6'],
    },
    [ColumnId.InProgress]: {
      id: ColumnId.InProgress,
      title: 'Em Progresso',
      taskIds: ['task-2', 'task-3'],
    },
    [ColumnId.Done]: {
      id: ColumnId.Done,
      title: 'Concluído',
      taskIds: ['task-5'],
    },
  },
  columnOrder: [ColumnId.ToDo, ColumnId.InProgress, ColumnId.Done],
  users: USERS,
};