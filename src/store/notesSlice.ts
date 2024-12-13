import { StateCreator } from 'zustand';
import { Note } from '../types/note';
import { HabitStore } from './habitStore';

export interface NotesSlice {
  addNote: (habitId: string, note: Omit<Note, 'id'>) => void;
  updateNote: (habitId: string, noteId: string, content: string) => void;
  deleteNote: (habitId: string, noteId: string) => void;
}

export const createNotesSlice: StateCreator<
  HabitStore,
  [],
  [],
  NotesSlice
> = (set) => ({
  addNote: (habitId, note) =>
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              notes: [
                ...(habit.notes || []),
                { ...note, id: crypto.randomUUID() },
              ],
            }
          : habit
      ),
    })),

  updateNote: (habitId, noteId, content) =>
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              notes: habit.notes?.map((note) =>
                note.id === noteId
                  ? {
                      ...note,
                      content,
                      updatedAt: new Date().toISOString(),
                    }
                  : note
              ),
            }
          : habit
      ),
    })),

  deleteNote: (habitId, noteId) =>
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              notes: habit.notes?.filter((note) => note.id !== noteId),
            }
          : habit
      ),
    })),
});