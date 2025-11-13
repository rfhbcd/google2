export enum Priority {
  Baixa = 'Baixa',
  Media = 'Média',
  Alta = 'Alta',
}

export type ColumnId = string;

export interface User {
  id: string; 
  name: string;
  avatar: string; // URL to avatar image or initials
  isAdmin?: boolean;
  email?: string;
  password?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeIds: string[];
  dueDate: string; // ISO string format
  priority: Priority;
  status: ColumnId;
  completionDate?: string; // ISO string format
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