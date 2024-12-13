import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, SubTask } from '../types/task';
import { sendNotification } from '../utils/notifications';
import { scheduleTaskAlarm, clearTaskAlarm } from '../utils/alarms';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'subtasks' | 'status' | 'tags'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addSubTask: (taskId: string, title: string) => void;
  updateSubTask: (taskId: string, subTaskId: string, updates: Partial<SubTask>) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  reorderSubTasks: (taskId: string, orderedIds: string[]) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  getTasksByHabit: (habitId: string) => Task[];
  getDueTasks: () => Task[];
  checkReminders: () => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (taskData) => {
        const id = crypto.randomUUID();
        const task: Task = {
          ...taskData,
          id,
          subtasks: [],
          tags: [],
          status: 'pending',
          reminders: taskData.reminders || { enabled: false, times: [] }
        };

        set(state => ({
          tasks: [...state.tasks, task]
        }));

        // Schedule alarm if enabled
        if (task.reminders.alarmEnabled && task.reminders.alarmTime) {
          scheduleTaskAlarm(task.id, task.title, task.dueDate, task.reminders.alarmTime);
        }

        return id;
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id !== id) return task;
            
            const updatedTask = { ...task, ...updates };
            
            // Handle alarm updates
            if (updatedTask.reminders?.alarmEnabled && updatedTask.reminders?.alarmTime) {
              scheduleTaskAlarm(id, updatedTask.title, updatedTask.dueDate, updatedTask.reminders.alarmTime);
            } else {
              clearTaskAlarm(`task-alarm-${id}`);
            }
            
            return updatedTask;
          })
        }));
      },

      deleteTask: (id) => {
        clearTaskAlarm(`task-alarm-${id}`);
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }));
      },

      // Rest of the store implementation remains the same...
      addSubTask: (taskId, title) =>
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id !== taskId) return task;
            const newSubTask: SubTask = {
              id: crypto.randomUUID(),
              title,
              completed: false,
              order: task.subtasks.length
            };
            return {
              ...task,
              subtasks: [...task.subtasks, newSubTask]
            };
          })
        })),

      updateSubTask: (taskId, subTaskId, updates) =>
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id !== taskId) return task;
            return {
              ...task,
              subtasks: task.subtasks.map(subtask =>
                subtask.id === subTaskId ? { ...subtask, ...updates } : subtask
              )
            };
          })
        })),

      deleteSubTask: (taskId, subTaskId) =>
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id !== taskId) return task;
            return {
              ...task,
              subtasks: task.subtasks.filter(subtask => subtask.id !== subTaskId)
            };
          })
        })),

      reorderSubTasks: (taskId, orderedIds) =>
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id !== taskId) return task;
            const reorderedSubtasks = orderedIds.map((id, index) => {
              const subtask = task.subtasks.find(s => s.id === id);
              return subtask ? { ...subtask, order: index } : subtask!;
            });
            return { ...task, subtasks: reorderedSubtasks };
          })
        })),

      toggleSubTask: (taskId, subTaskId) =>
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id !== taskId) return task;
            return {
              ...task,
              subtasks: task.subtasks.map(subtask =>
                subtask.id === subTaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask
              )
            };
          })
        })),

      getTasksByHabit: (habitId) => {
        return get().tasks.filter(task => task.habitId === habitId);
      },

      getDueTasks: () => {
        const now = new Date();
        return get().tasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          return dueDate >= now && task.status === 'pending';
        }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      },

      checkReminders: () => {
        const now = new Date();
        const tasks = get().tasks;

        tasks.forEach(task => {
          if (!task.reminders.enabled) return;

          // Check regular reminders
          if (task.reminders.notifyBefore) {
            const dueDate = new Date(task.dueDate);
            const notifyTime = new Date(dueDate.getTime() - task.reminders.notifyBefore * 60000);

            if (Math.abs(now.getTime() - notifyTime.getTime()) < 60000) {
              sendNotification(`Task Reminder: ${task.title}`, {
                body: `Due in ${task.reminders.notifyBefore} minutes!`,
                tag: `task-${task.id}`,
                renotify: true
              });
            }
          }
        });
      }
    }),
    {
      name: 'task-storage',
      onRehydrateStorage: () => (state) => {
        // Re-initialize alarms after rehydration
        if (state?.tasks) {
          initializeTaskAlarms(state.tasks);
        }
      }
    }
  )
);