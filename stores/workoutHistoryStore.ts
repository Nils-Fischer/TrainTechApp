// stores/workoutHistoryStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WorkoutSession, ExerciseRecord } from "~/lib/types";

interface WorkoutHistoryState {
  sessions: WorkoutSession[];
  init: () => Promise<void>;
  addWorkoutSession: (session: WorkoutSession) => Promise<void>;
  getLastWorkout: (exerciseId: number) => ExerciseRecord | undefined;
}

const STORAGE_KEY = "@workout_history";

export const useWorkoutHistoryStore = create<WorkoutHistoryState>((set, get) => ({
  sessions: [],

  init: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const sessions = JSON.parse(stored);
        // Convert stored date strings back to Date objects
        sessions.forEach((session: WorkoutSession) => {
          session.date = new Date(session.date);
        });
        set({ sessions });
      }
    } catch (e) {
      console.error("Failed to load workout history:", e);
    }
  },

  addWorkoutSession: async (session: WorkoutSession) => {
    try {
      const newSessions = [...get().sessions, session];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
      set({ sessions: newSessions });
    } catch (e) {
      console.error("Failed to save workout session:", e);
    }
  },

  getLastWorkout: (exerciseId: number) => {
    const { sessions } = get();
    // Sort sessions by date in descending order
    const sortedSessions = [...sessions].sort((a, b) => b.date.getTime() - a.date.getTime());

    // Find the last session containing the exercise
    for (const session of sortedSessions) {
      const exercise = session.entries.find((entry) => entry.exerciseId === exerciseId);
      if (exercise) return exercise;
    }
    return undefined;
  },
}));
