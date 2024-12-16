import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { ActiveWorkoutStats } from "~/components/ActiveWorkout/ActiveWorkoutStats";
import { ActiveWorkoutControls } from "~/components/ActiveWorkout/ActiveWorkoutControls";
import { ActiveWorkoutExerciseList } from "~/components/ActiveWorkout/ActiveWorkoutExerciseList";
import { ActiveWorkoutModals } from "~/components/ActiveWorkout/ActiveWorkoutModals";
import { useUserStore } from "~/stores/userStore";
import { useActiveWorkoutStore } from "~/stores/activeWorkoutStore";
import { ChevronLeft } from "~/lib/icons/Icons";

export default function ActiveWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getActiveRoutine, isLoading, error } = useUserStore();
  const activeWorkout = getActiveRoutine()?.workouts.find((workout) => workout.id === parseInt(id));

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

  const { isStarted, isPaused, startWorkout, pauseWorkout, resumeWorkout, endWorkout } = useActiveWorkoutStore();

  // Loading State
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Error State
  if (error || !activeWorkout) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-destructive">Workout nicht gefunden</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: activeWorkout.name,
          headerLeft: () => (
            <Button variant="ghost" className="ml-2" onPress={() => router.back()}>
              <ChevronLeft size={24} />
            </Button>
          ),
          headerRight: () =>
            activeWorkout ? (
              <Button variant="ghost" className="mr-2" onPress={() => setIsEditMode(!isEditMode)}>
                <Text className="text-destructive">{isEditMode ? "Fertig" : "Bearbeiten"}</Text>
              </Button>
            ) : null,
        }}
      />
      <View className="flex-1 bg-background">
        <ActiveWorkoutStats />

        <ActiveWorkoutExerciseList
          workout={activeWorkout}
          isEditMode={isEditMode}
          isStarted={isStarted}
          onExerciseSelect={setSelectedExerciseId}
        />

        <ActiveWorkoutControls
          isEditMode={isEditMode}
          isStarted={isStarted}
          isPaused={isPaused}
          onStart={() => startWorkout(activeWorkout.id, activeWorkout.exercises)}
          onPause={pauseWorkout}
          onResume={resumeWorkout}
          onEnd={endWorkout}
        />

        <ActiveWorkoutModals
          workout={activeWorkout}
          selectedExerciseId={selectedExerciseId}
          onExerciseClose={() => setSelectedExerciseId(null)}
          isStarted={isStarted}
        />
      </View>
    </>
  );
}