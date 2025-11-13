import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { KanbanData, Task, User, ColumnId, Priority, Column } from '../types';
import { initialData } from '../constants';

// --- STATE & ACTIONS ---
interface AppState {
  data: KanbanData;
  loggedInUser: User | null;
  filters: {
    assigneeId: string | null;
    priority: Priority | null;
  };
}

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'MOVE_TASK'; payload: { taskId: string; sourceColumnId: ColumnId; destColumnId: ColumnId; sourceIndex: number; destIndex: number } }
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id'> }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: { taskId: string } }
  | { type: 'ADD_COLUMN'; payload: { title: string } }
  | { type: 'UPDATE_COLUMN_TITLE'; payload: { columnId: string; newTitle: string } }
  | { type: 'DELETE_COLUMN'; payload: { columnId: ColumnId } }
  | { type: 'REORDER_COLUMN'; payload: { sourceIndex: number, destinationIndex: number } }
  | { type: 'ADD_USER'; payload: Omit<User, 'id' | 'avatar'> }
  | { type: 'DELETE_USER'; payload: { userId: string } }
  | { type: 'SET_FILTER'; payload: { filterType: 'assigneeId' | 'priority'; value: string | null } }
  | { type: 'CLEAR_FILTERS' };

// --- REDUCER ---
const kanbanReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, loggedInUser: action.payload };
    case 'ADD_TASK': {
        const newTask: Task = {
            ...action.payload,
            id: `task-${Date.now()}`,
        };
        const column = state.data.columns[newTask.status];
        const newTaskIds = [...column.taskIds, newTask.id];

        return {
            ...state,
            data: {
                ...state.data,
                tasks: { ...state.data.tasks, [newTask.id]: newTask },
                columns: {
                    ...state.data.columns,
                    [newTask.status]: { ...column, taskIds: newTaskIds }
                }
            }
        };
    }
    case 'UPDATE_TASK': {
        const updatedTask = action.payload;
        const oldTask = state.data.tasks[updatedTask.id];
        
        if(oldTask && oldTask.status !== updatedTask.status) {
            const sourceColumn = state.data.columns[oldTask.status];
            const destColumn = state.data.columns[updatedTask.status];
            const newSourceTaskIds = sourceColumn.taskIds.filter(id => id !== updatedTask.id);
            const newDestTaskIds = [...destColumn.taskIds, updatedTask.id];

            return {
                ...state,
                data: {
                    ...state.data,
                    tasks: { ...state.data.tasks, [updatedTask.id]: updatedTask },
                    columns: {
                        ...state.data.columns,
                        [oldTask.status]: { ...sourceColumn, taskIds: newSourceTaskIds },
                        [updatedTask.status]: { ...destColumn, taskIds: newDestTaskIds },
                    }
                }
            };
        }

        return {
            ...state,
            data: { ...state.data, tasks: { ...state.data.tasks, [updatedTask.id]: updatedTask } }
        };
    }
    case 'DELETE_TASK': {
        const { taskId } = action.payload;
        const taskToDelete = state.data.tasks[taskId];
        if(!taskToDelete) return state;

        const newTasks = { ...state.data.tasks };
        delete newTasks[taskId];

        const column = state.data.columns[taskToDelete.status];
        const newTaskIds = column.taskIds.filter(id => id !== taskId);

        return {
            ...state,
            data: {
                ...state.data,
                tasks: newTasks,
                columns: { ...state.data.columns, [taskToDelete.status]: { ...column, taskIds: newTaskIds } }
            }
        };
    }
    case 'MOVE_TASK': {
        const { taskId, sourceColumnId, destColumnId, sourceIndex, destIndex } = action.payload;
        const sourceColumn = state.data.columns[sourceColumnId];
        const destColumn = state.data.columns[destColumnId];
        const newSourceTaskIds = Array.from(sourceColumn.taskIds);
        newSourceTaskIds.splice(sourceIndex, 1);
        
        const newDestTaskIds = sourceColumnId === destColumnId ? newSourceTaskIds : Array.from(destColumn.taskIds);
        newDestTaskIds.splice(destIndex, 0, taskId);
        
        const task = state.data.tasks[taskId];
        const updatedTask = { ...task, status: destColumnId };
        
        const { columnOrder } = state.data;
        const doneColumnId = columnOrder[columnOrder.length - 1];
        if (destColumnId === doneColumnId) {
            updatedTask.completionDate = new Date().toISOString();
        } else if (task.status === doneColumnId && destColumnId !== doneColumnId) {
            delete updatedTask.completionDate;
        }

        return {
            ...state,
            data: {
                ...state.data,
                columns: {
                    ...state.data.columns,
                    [sourceColumnId]: { ...sourceColumn, taskIds: newSourceTaskIds },
                    [destColumnId]: { ...destColumn, taskIds: newDestTaskIds },
                },
                 tasks: { ...state.data.tasks, [taskId]: updatedTask }
            }
        };
    }
     case 'ADD_COLUMN': {
      const { title } = action.payload;
      const newColumnId = `column-${Date.now()}`;
      const newColumn: Column = {
        id: newColumnId,
        title,
        taskIds: [],
      };
      return {
        ...state,
        data: {
          ...state.data,
          columns: { ...state.data.columns, [newColumnId]: newColumn },
          columnOrder: [...state.data.columnOrder, newColumnId],
        },
      };
    }
    case 'UPDATE_COLUMN_TITLE': {
        const { columnId, newTitle } = action.payload;
        const column = state.data.columns[columnId];
        if(!column) return state;
        const updatedColumn = { ...column, title: newTitle };
        return {
            ...state,
            data: {
                ...state.data,
                columns: { ...state.data.columns, [columnId]: updatedColumn }
            }
        };
    }
    case 'DELETE_COLUMN': {
        const { columnId } = action.payload;
        const newColumns = { ...state.data.columns };
        delete newColumns[columnId];
        const newColumnOrder = state.data.columnOrder.filter(id => id !== columnId);
        return {
            ...state,
            data: { ...state.data, columns: newColumns, columnOrder: newColumnOrder }
        };
    }
    case 'REORDER_COLUMN': {
        const { sourceIndex, destinationIndex } = action.payload;
        const newColumnOrder = Array.from(state.data.columnOrder);
        const [removed] = newColumnOrder.splice(sourceIndex, 1);
        newColumnOrder.splice(destinationIndex, 0, removed);
        return {
            ...state,
            data: { ...state.data, columnOrder: newColumnOrder }
        };
    }
    case 'ADD_USER': {
        const { name, password, isAdmin } = action.payload;
        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            password,
            isAdmin,
            avatar: name.charAt(0).toUpperCase(),
        };
        return { ...state, data: { ...state.data, users: [...state.data.users, newUser] } };
    }
    case 'DELETE_USER': {
        const { userId } = action.payload;
        const newUsers = state.data.users.filter(user => user.id !== userId);
        const newTasks = Object.fromEntries(
            Object.entries(state.data.tasks).map(([taskId, task]) => {
                if (task.assigneeIds.includes(userId)) {
                    return [taskId, { ...task, assigneeIds: task.assigneeIds.filter(id => id !== userId) }];
                }
                return [taskId, task];
            })
        );
        return { ...state, data: { ...state.data, users: newUsers, tasks: newTasks } };
    }
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, [action.payload.filterType]: action.payload.value } };
    case 'CLEAR_FILTERS':
      return { ...state, filters: { assigneeId: null, priority: null } };
    default:
      return state;
  }
};

// --- CONTEXT & PROVIDER ---
const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

const initialState: AppState = {
    data: initialData,
    loggedInUser: null,
    filters: { assigneeId: null, priority: null },
};


export const StoreProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(kanbanReducer, initialState);

  // Persistence to localStorage and tab synchronization have been removed.
  // The application state is now ephemeral and will reset on page refresh.

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useKanbanStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useKanbanStore must be used within a StoreProvider');
  }
  return context;
};
