export enum Level {
  Beginner = 1,
  Intermediate = 2,
  Expert = 3,
}

export enum TrainingGoal {
  Strength,
  Hypertrophy,
  Endurance,
}

export enum LocationType {
  Home,
  Gym,
}
export interface Message {
  id: number;
  isAI: boolean;
  message: string;
  time: string;
}
export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time?: string;
}

export interface NutritionProgress {
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  goals: NutritionGoals;
}

export interface Exercise {
  alternatives: never[];
  timesUsed: string;
  id: number;
  name: string;
  level: string;
  mechanic: string;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
  tag: string[];
  priority: number;
}

export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}

export interface WorkoutExercise {
  exerciseId: number;
  alternatives: number[];
  sets: number;
  reps: number;
  restPeriod?: number;
  notes?: string;
  isMarked?: boolean;
}

export interface Workout {
  id: number;
  name: string;
  exercises: WorkoutExercise[];
  duration?: number;
  description?: string;
}

export interface Routine {
  id: number;
  name: string;
  workouts: Workout[];
  description?: string;
  frequency: number;
  active: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  age: number;
  gender: Gender;
}

export interface UserData {
  routines: Routine[];
  created_at: string;
  last_updated: string;
}
/* 

enum EquipmentType {
  Barbell = "Barbell",
  Dumbbell = "Dumbbell",
  Machine = "Machine",
  Cable = "Cable",
  Bodyweight = "Bodyweight",
  Specialty = "Specialty",
}

enum MuscleGroup {
  Chest = "Chest",
  Back = "Back",
  Shoulders = "Shoulders",
  Biceps = "Biceps",
  Triceps = "Triceps",
  Core = "Core",
  Legs = "Legs",
}

enum Difficulty {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
}

enum Mechanic {
  Compound = "Compound",
  Isolation = "Isolation",
}

interface Exercise {
  id: string;
  name: string;
  equipment: EquipmentType;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups?: MuscleGroup[];
  difficulty: Difficulty;
  tag: string; // type of exercise
  mechanic: Mechanic;
  variations?: string[];
  commonMistakes?: string[];
  warmup?: string[];
  instructions: string[];
  description: string;
  media: string[];
}
*/

export interface SetInput {
  reps: number;
  weight: number;
  isCompleted?: boolean;
  previousWeight?: number;
  previousReps?: number;
}
export interface WorkoutHistoryEntry {
  date: string;
  sets: SetInput[];
  volume?: number;
}
export interface WorkoutHistory {
  [exerciseId: number]: WorkoutHistoryEntry;
}

export interface WorkoutHistoryStore {
  history: WorkoutHistory;
  addWorkoutHistory: (exerciseId: number, sets: SetInput[]) => Promise<void>;
  getLastWorkout: (exerciseId: number) => WorkoutHistoryEntry | undefined;
  init: () => Promise<void>;
}

export interface WarmUpSet {
  percentage: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

export interface PreviousWorkout {
  date: string;
  sets: SetInput[];
  volume: number;
}
export interface ExerciseModalProps {
  isVisible: boolean;
  onClose: () => void;
  exercise: Exercise;
  workoutExercise: WorkoutExercise;
  isWorkoutStarted: boolean;
  onSave: (sets: SetInput[]) => void;
  previousWorkout?: WorkoutHistoryEntry;
  mode?: "planning" | "workout";
}

// In deiner bestehenden types.ts, nach den anderen Interfaces

export interface WorkoutPerformance {
  date: string;
  volume: number;
  intensity: number;
  completedSets: number;
  totalSets: number;
  duration: number;
  exercises: {
    id: number;
    performance: number; // Prozentuale Leistung (0-100)
    improvement: number; // Verbesserung zum letzten Mal
  }[];
}

export interface WorkoutTrend {
  lastFive: WorkoutPerformance[];
  average: {
    volume: number;
    intensity: number;
    completion: number; // Prozent der completed Sets
  };
  bestPerformance: WorkoutPerformance;
  consistency: number; // Trainings-Konstanz (0-100)
  currentStreak: number;
}

export interface RecoveryRecommendation {
  nextWorkoutIn: number; // Tage
  recommendedIntensity: number;
  tips: {
    type: "nutrition" | "sleep" | "activity";
    message: string;
    priority: "high" | "medium" | "low";
  }[];
}

export interface WorkoutProgressStore {
  performances: WorkoutPerformance[];
  addPerformance: (performance: WorkoutPerformance) => void;
  getTrend: () => WorkoutTrend;
  getRecoveryRecommendation: () => RecoveryRecommendation;
}
export interface IntelligentFeedback {
  type: "performance" | "recovery" | "motivation";
  message: string;
  recommendation?: string;
  priority: "high" | "medium" | "low";
}

export interface CoachResponse {
  mainMessage: string;
  details: IntelligentFeedback[];
  nextWorkoutSuggestion?: {
    weight: number;
    intensity: number;
    recoveryTime: number;
  };
}
