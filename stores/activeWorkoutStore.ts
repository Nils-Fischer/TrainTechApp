import { create } from "zustand";
import type { ExerciseRecord, SetInput, Workout, WorkoutExercise, WorkoutSession } from "~/lib/types";
import { useWorkoutHistoryStore } from "./workoutHistoryStore";

interface ActiveWorkoutState {
  isStarted: boolean;
  isResting: boolean;
  startTime: number | null;
  elapsedTime: number;
  restStartTime: number | null;
  remainingRestTime: number;

  activeWorkout: Workout | null;
  activeSession: WorkoutSession | null;

  timerInterval: NodeJS.Timeout | null;

  setWorkout: (workout: Workout) => void;
  updateExerciseRecord: (record: ExerciseRecord) => void;
  startWorkout: () => void;
  startRestTimer: (restTime: number) => void;
  stopRestTimer: () => void;
  cancelWorkout: () => void;
  finishWorkout: () => WorkoutSession | null;
  finishExercise: (exerciseId: number, intensity?: number) => void;

  // Stats
  getCurrentStats: () => {
    duration: number;
    totalVolume: number;
    completedExercises: number;
    remainingExercises: number;
    completedSets: number;
    remainingSets: number;
  };
}

const getSetSuggestion = (exercise: WorkoutExercise): SetInput[] => {
  const workoutHistory = useWorkoutHistoryStore.getState();
  const lastWorkout = workoutHistory.getLastExerciseRecord(exercise.exerciseId);

  if (lastWorkout?.sets?.length) {
    return lastWorkout.sets.map((set) => ({
      weight: null,
      reps: null,
      targetWeight: set.weight || 0,
      targetReps: exercise.reps,
    }));
  }

  return Array.from({ length: exercise.sets }, () => ({
    weight: null,
    reps: null,
    targetWeight: 0,
    targetReps: exercise.reps,
  }));
};

const getNewSession = (workout: Workout): WorkoutSession => {
  return {
    date: new Date(),
    entries: workout.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: getSetSuggestion(exercise),
      intensity: undefined,
      isCompleted: false,
    })),
    workoutId: workout.id,
  };
};

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set, get) => ({
  isStarted: false,
  isResting: false,
  startTime: null,
  elapsedTime: 0,
  timerInterval: null,
  activeWorkout: null,
  activeSession: null,
  restStartTime: null,
  remainingRestTime: 0,

  setWorkout: (workout: Workout) => {
    const session = getNewSession(workout);
    set({ activeWorkout: workout, activeSession: session });
  },

  updateExerciseRecord: (record: ExerciseRecord) => {
    set((state) => ({
      activeSession: state.activeSession
        ? {
            ...state.activeSession,
            entries: state.activeSession.entries.map((entry) =>
              entry.exerciseId === record.exerciseId ? record : entry
            ),
          }
        : null,
    }));
  },

  startWorkout: () => {
    const workout = get().activeWorkout;
    if (!workout) {
      console.error("No workout set");
      return;
    }
    const session = get().activeSession;
    if (!session) {
      console.error("No session set");
      return;
    }

    const newSession: WorkoutSession = {
      ...session,
      entries: session.entries.map((entry) => ({
        ...entry,
        sets: entry.sets.map((set) => ({
          weight: null,
          reps: null,
          targetWeight: set.weight || set.targetWeight || 0,
          targetReps: set.reps || set.targetReps || 0,
        })),
      })),
    };

    const timerInterval = get().timerInterval;
    timerInterval && clearInterval(timerInterval);

    const interval = setInterval(() => {
      set((state) => ({
        elapsedTime: state.startTime ? Date.now() - state.startTime : 0,
      }));
    }, 1000);

    set({
      isStarted: true,
      isResting: false,
      startTime: Date.now(),
      elapsedTime: 0,
      activeSession: newSession,
      timerInterval: interval,
    });
  },

  cancelWorkout: () => {
    const timerInterval = get().timerInterval;
    timerInterval && clearInterval(timerInterval);
    const currentWorkout = get().activeWorkout;
    if (!currentWorkout) return;
    set({
      isStarted: false,
      isResting: false,
      startTime: null,
      elapsedTime: 0,
      activeSession: getNewSession(currentWorkout),
      timerInterval: null,
    });
  },

  finishWorkout: () => {
    const timerInterval = get().timerInterval;
    timerInterval && clearInterval(timerInterval);

    const currentWorkout = get().activeWorkout;
    if (!currentWorkout) return null;

    const currentSession = get().activeSession;

    set({
      isStarted: false,
      isResting: false,
      startTime: null,
      elapsedTime: 0,
      activeWorkout: null,
      timerInterval: null,
      activeSession: null,
    });

    return currentSession;
  },

  finishExercise: (exerciseId: number, intensity = undefined) => {
    set((state) => ({
      activeSession: state.activeSession
        ? {
            ...state.activeSession,
            entries: state.activeSession.entries.map((entry) =>
              entry.exerciseId === exerciseId ? { ...entry, isCompleted: true, intensity } : entry
            ),
          }
        : null,
    }));
  },

  getCurrentStats: () => {
    const currentSession = get().activeSession;
    if (!currentSession) {
      return {
        duration: 0,
        totalVolume: 0,
        completedExercises: 0,
        remainingExercises: 0,
        completedSets: 0,
        remainingSets: 0,
      };
    }

    const totalVolume = currentSession.entries.reduce((acc, entry) => {
      return acc + entry.sets.reduce((setAcc, set) => setAcc + (set.weight || 0) * (set.reps || 0), 0);
    }, 0);

    const completedSets = currentSession.entries.reduce((acc, entry) => acc + entry.sets.length, 0);

    const totalTargetSets = currentSession.entries.reduce((acc, entry) => acc + (entry.sets?.length || 0), 0);

    return {
      duration: get().elapsedTime,
      totalVolume,
      completedExercises: currentSession.entries.filter((e) => e.isCompleted).length,
      remainingExercises: currentSession.entries.filter((e) => !e.isCompleted).length,
      completedSets,
      remainingSets: totalTargetSets - completedSets,
    };
  },

  startRestTimer: (restTime: number) => {
    const timerInterval = get().timerInterval;
    timerInterval && clearInterval(timerInterval);

    const interval = setInterval(() => {
      set((state) => {
        const elapsed = state.restStartTime ? Date.now() - state.restStartTime : 0;
        const remaining = restTime * 1000 - elapsed;

        return {
          remainingRestTime: remaining,
        };
      });
    }, 100);

    set({
      isResting: true,
      restStartTime: Date.now(),
      remainingRestTime: restTime * 1000,
      timerInterval: interval,
    });
  },

  stopRestTimer: () => {
    const timerInterval = get().timerInterval;
    timerInterval && clearInterval(timerInterval);

    set({
      isResting: false,
      restStartTime: null,
      remainingRestTime: 0,
      timerInterval: null,
    });
  },
}));
