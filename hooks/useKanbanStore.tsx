import React, { createContext, useReducer, useContext, useEffect, ReactNode } from 'react';
import { KanbanData, Task, User, ColumnId, Priority } from '../types';
import { INITIAL_DATA } from '../constants';

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
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_USER'; payload: { name: string; password: string; isAdmin?: boolean } }
  | { type: 'DELETE_USER'; payload: { userId: string } }
  | { type: 'MOVE_TASK'; payload: { taskId: string; sourceColumnId: ColumnId; destColumnId: ColumnId; destIndex: number } }
  | { type: 'REORDER_COLUMN'; payload: { sourceIndex: number; destinationIndex: number } }
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id'> }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: { taskId: string } }
  | { type: 'ADD_COLUMN'; payload: { title: string } }
  | { type: 'UPDATE_COLUMN_TITLE'; payload: { columnId: ColumnId; newTitle: string } }
  | { type: 'DELETE_COLUMN'; payload: { columnId: ColumnId } }
  | { type: 'SET_FILTER'; payload: { filterType: 'assigneeId' | 'priority'; value: string | null } }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'CHECK_DUE_DATES' }; // Not really an action, just a trigger

// --- REDUCER ---
const kanbanReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, loggedInUser: action.payload };
    case 'LOGOUT':
      return { ...state, loggedInUser: null };
    case 'ADD_USER': {
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: action.payload.name,
            password: action.payload.password,
            avatar: action.payload.name.split(' ').map(n => n[0]).join('').toUpperCase(),
            isAdmin: action.payload.isAdmin || false,
        };
        const newData = { ...state.data, users: [...state.data.users, newUser] };
        return { ...state, data: newData };
    }
    case 'DELETE_USER': {
        const { userId } = action.payload;

        // Filter out the deleted user
        const newUsers = state.data.users.filter(user => user.id !== userId);

        // Unassign the deleted user from all tasks using an immutable approach
        const newTasks = Object.fromEntries(
            Object.entries(state.data.tasks).map(([taskId, task]) => {
                if (task.assigneeIds.includes(userId)) {
                    // Return a new task object with the user unassigned
                    return [taskId, {
                        ...task,
                        assigneeIds: task.assigneeIds.filter(id => id !== userId)
                    }];
                }
                // Return the original task if no change is needed
                return [taskId, task];
            })
        );
        
        // Clear the assignee filter if the deleted user was selected
        const newFilters = state.filters.assigneeId === userId
            ? { ...state.filters, assigneeId: null }
            : state.filters;

        return {
            ...state,
            data: {
                ...state.data,
                users: newUsers,
                tasks: newTasks,
            },
            filters: newFilters,
        };
    }
    case 'MOVE_TASK': {
      const { taskId, sourceColumnId, destColumnId, destIndex } = action.payload;
      const sourceColumn = state.data.columns[sourceColumnId];
      const destColumn = state.data.columns[destColumnId];

      const newSourceTaskIds = Array.from(sourceColumn.taskIds);
      newSourceTaskIds.splice(newSourceTaskIds.indexOf(taskId), 1);

      const newDestTaskIds = Array.from(destColumn.taskIds);
      newDestTaskIds.splice(destIndex, 0, taskId);

      const task = state.data.tasks[taskId];
      const { columnOrder } = state.data;
      const doneColumnId = columnOrder[columnOrder.length - 1];
      const updatedTask = { ...task, status: destColumnId };
      const wasInDone = sourceColumnId === doneColumnId;
      const isNowInDone = destColumnId === doneColumnId;
      
      if (isNowInDone && !wasInDone) {
        updatedTask.completionDate = new Date().toISOString();
      } else if (!isNowInDone && wasInDone) {
        delete updatedTask.completionDate;
      }

      const newData: KanbanData = {
        ...state.data,
        columns: {
          ...state.data.columns,
          [sourceColumnId]: { ...sourceColumn, taskIds: newSourceTaskIds },
          [destColumnId]: { ...destColumn, taskIds: newDestTaskIds },
        },
        tasks: {
            ...state.data.tasks,
            [taskId]: updatedTask
        }
      };
      return { ...state, data: newData };
    }
    case 'REORDER_COLUMN': {
      const { sourceIndex, destinationIndex } = action.payload;
      const newColumnOrder = Array.from(state.data.columnOrder);
      const [removed] = newColumnOrder.splice(sourceIndex, 1);
      newColumnOrder.splice(destinationIndex, 0, removed);
      return { ...state, data: { ...state.data, columnOrder: newColumnOrder } };
    }
    case 'ADD_TASK': {
        const newTaskId = `task-${Date.now()}`;
        const newTask: Task = { id: newTaskId, ...action.payload };
        const column = state.data.columns[newTask.status];
        const newTaskIds = [...column.taskIds, newTaskId];

        const newData: KanbanData = {
            ...state.data,
            tasks: { ...state.data.tasks, [newTaskId]: newTask },
            columns: {
                ...state.data.columns,
                [newTask.status]: { ...column, taskIds: newTaskIds }
            }
        };
        return { ...state, data: newData };
    }
    case 'UPDATE_TASK': {
        const updatedTaskPayload = action.payload;
        const oldTask = state.data.tasks[updatedTaskPayload.id];
        
        const { columnOrder } = state.data;
        const doneColumnId = columnOrder[columnOrder.length - 1];
        const wasInDone = oldTask.status === doneColumnId;
        const isNowInDone = updatedTaskPayload.status === doneColumnId;

        const updatedTask = { ...updatedTaskPayload };
        if (isNowInDone && !wasInDone) {
          updatedTask.completionDate = new Date().toISOString();
        } else if (!isNowInDone && wasInDone) {
          delete updatedTask.completionDate;
        }

        // if status changed, move task between columns
        if(oldTask.status !== updatedTask.status) {
            const sourceColumn = state.data.columns[oldTask.status];
            const destColumn = state.data.columns[updatedTask.status];
            const newSourceTaskIds = sourceColumn.taskIds.filter(id => id !== updatedTask.id);
            const newDestTaskIds = [...destColumn.taskIds, updatedTask.id];

            const newData: KanbanData = {
                ...state.data,
                tasks: { ...state.data.tasks, [updatedTask.id]: updatedTask },
                columns: {
                    ...state.data.columns,
                    [oldTask.status]: { ...sourceColumn, taskIds: newSourceTaskIds },
                    [updatedTask.status]: { ...destColumn, taskIds: newDestTaskIds },
                }
            };
            return { ...state, data: newData };
        }

        const newData: KanbanData = {
            ...state.data,
            tasks: { ...state.data.tasks, [updatedTask.id]: updatedTask },
        };
        return { ...state, data: newData };
    }
    case 'DELETE_TASK': {
        const { taskId } = action.payload;
        const taskToDelete = state.data.tasks[taskId];
        if(!taskToDelete) return state;

        const newTasks = { ...state.data.tasks };
        delete newTasks[taskId];

        const column = state.data.columns[taskToDelete.status];
        const newTaskIds = column.taskIds.filter(id => id !== taskId);

        const newData: KanbanData = {
            ...state.data,
            tasks: newTasks,
            columns: {
                ...state.data.columns,
                [taskToDelete.status]: { ...column, taskIds: newTaskIds }
            }
        };
        return { ...state, data: newData };
    }
    case 'ADD_COLUMN': {
      const { title } = action.payload;
      const newColumnId = `column-${Date.now()}`;
      const newColumn = {
        id: newColumnId,
        title,
        taskIds: [],
      };
      return {
        ...state,
        data: {
          ...state.data,
          columns: {
            ...state.data.columns,
            [newColumnId]: newColumn,
          },
          columnOrder: [...state.data.columnOrder, newColumnId],
        },
      };
    }
    case 'UPDATE_COLUMN_TITLE': {
      const { columnId, newTitle } = action.payload;
      const columnToUpdate = state.data.columns[columnId];
      if (!columnToUpdate) return state;

      const updatedColumn = { ...columnToUpdate, title: newTitle };
      return {
        ...state,
        data: {
          ...state.data,
          columns: {
            ...state.data.columns,
            [columnId]: updatedColumn,
          },
        },
      };
    }
    case 'DELETE_COLUMN': {
      const { columnId } = action.payload;
      const columnToDelete = state.data.columns[columnId];

      // Prevent deletion of non-empty columns
      if (!columnToDelete || columnToDelete.taskIds.length > 0) {
        return state;
      }

      const newColumns = { ...state.data.columns };
      delete newColumns[columnId];

      const newColumnOrder = state.data.columnOrder.filter(id => id !== columnId);

      return {
        ...state,
        data: {
          ...state.data,
          columns: newColumns,
          columnOrder: newColumnOrder,
        },
      };
    }
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.payload.filterType]: action.payload.value },
      };
    case 'CLEAR_FILTERS':
      return { ...state, filters: { assigneeId: null, priority: null } };
    case 'CHECK_DUE_DATES':
        // This is a dummy action to trigger re-renders if needed, but the main logic is in the date helpers.
        // It forces components that depend on date statuses to re-evaluate.
        return { ...state };
    default:
      return state;
  }
};

// --- CONTEXT & PROVIDER ---
const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

const getInitialState = (): AppState => {
  try {
    const persistedState = localStorage.getItem('kanbanState');
    if (persistedState) {
      const parsed = JSON.parse(persistedState);
      // Ensure data structure is valid after loading from storage
      return {
        data: parsed.data || INITIAL_DATA,
        loggedInUser: parsed.loggedInUser || null,
        filters: parsed.filters || { assigneeId: null, priority: null }
      };
    }
  } catch (error) {
    console.error("Could not load state from localStorage", error);
  }
  return {
    data: INITIAL_DATA,
    loggedInUser: null,
    filters: { assigneeId: null, priority: null },
  };
};

export const StoreProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(kanbanReducer, getInitialState());

  useEffect(() => {
    try {
      // This simulates shared storage by saving to localStorage. In a real multi-user app, this would be a WebSocket or API call.
      localStorage.setItem('kanbanState', JSON.stringify(state));
    } catch (error) {
      console.error("Could not save state to localStorage", error);
    }
  }, [state]);

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