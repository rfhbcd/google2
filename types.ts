
export enum Priority {
  Baixa = 'Baixa',
  Media = 'Média',
  Alta = 'Alta',
}

export enum ColumnId {
  ToDo = 'ToDo',
  InProgress = 'InProgress',
  Done = 'Done',
}

export interface User {
  id: string;
  name: string;
  password: string;
  avatar: string; // URL to avatar image or initials
  isAdmin?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeIds: string[];
  dueDate: string; // ISO string format
  priority: Priority;
  status: ColumnId;
}

export interface Column {
  id: ColumnId;
  title: string;
  taskIds: string[];
}

export interface KanbanData {
  tasks: Record<string, Task>;
  columns: Record<ColumnId, Column>;
  columnOrder: ColumnId[];
  users: User[];
}