import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native"; // Add Pressable import
import { useLocalSearchParams, useRouter } from "expo-router"; // Add useRouter
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Text } from "~/components/ui/text";
import { MoreHorizontal } from "~/lib/icons/Icons";
import { Button } from "~/components/ui/button";
import { Routine, Workout, WorkoutExercise } from "~/lib/types";
import { useUserStore } from "~/stores/userStore";
import { useExerciseStore } from "~/stores/exerciseStore";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RoutineWorkout = ({
  workout,
  routineName,
}: {
  workout: Workout;
  exercises: WorkoutExercise[];
  routineName: string;
}) => {
  const exerciseStore = useExerciseStore();
  const router = useRouter(); // Add this

  // Helper function to find full exercise details
  const findFullExercise = (workoutExercise: WorkoutExercise) => {
    return exerciseStore.exercises.find((ex) => ex.id === workoutExercise.exerciseId);
  };

  const getRepsRange = (exercise: WorkoutExercise) => {
    if (exercise.reps === 10) return "10 Wdh.";
    if (Array.isArray(exercise.reps)) return `${exercise.reps[0]}-${exercise.reps[1]} Wdh.`;
    return `${exercise.reps} Wdh.`;
  };

  return (
    <View className="flex-1">
      <View className="flex-row justify-between items-center mb-3">
        <Button variant="link" className="h-8 px-0">
          <Text className="text-primary text-sm font-medium">+ Übung hinzufügen</Text>
        </Button>
        <Text className="text-sm text-muted-foreground">{routineName}</Text>
      </View>

      <View className="gap-3">
        {workout.exercises.map((workoutExercise) => {
          const exercise = findFullExercise(workoutExercise);
          if (!exercise) return null;

          return (
            <Pressable
              key={workoutExercise.exerciseId}
              onPress={() => router.push(`/workout/exercise/${exercise.id}`)}
              className="active:opacity-70"
            >
              <View className="bg-card rounded-xl p-4 border border-border">
                <View className="flex-row justify-between items-start">
                  <View className="flex-row gap-3">
                    <View className="w-12 h-12 bg-muted rounded-lg items-center justify-center">
                      {exercise.images?.[0] ? (
                        <Image
                          source={{ uri: exercise.images[0] }}
                          alt={exercise.name}
                          className="w-8 h-8 object-cover"
                        />
                      ) : (
                        <Image
                          source={{ uri: "/api/placeholder/48/48" }}
                          alt={exercise.name}
                          className="w-8 h-8 object-cover"
                        />
                      )}
                    </View>
                    <View>
                      <Text className="font-medium mb-1">{exercise.name}</Text>
                      <Text className="text-muted-foreground text-sm">{exercise.equipment}</Text>
                    </View>
                  </View>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </View>
                <Text className="mt-3 text-sm text-muted-foreground">
                  {workoutExercise.sets} Sätze • {getRepsRange(workoutExercise)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default function RoutineDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userStore = useUserStore();
  const routine: Routine | undefined = userStore.userData?.programs.find((p) => p.id === Number(id));
  const [activeTab, setActiveTab] = useState(routine?.workouts[0]?.id.toString() || "0");

  if (!routine) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-muted-foreground">Trainingsplan nicht gefunden</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-col gap-1.5">
            <TabsList className="flex-row w-full mb-4">
              {routine.workouts.map((workout) => (
                <TabsTrigger key={workout.id} value={workout.id.toString()} className="flex-1">
                  <Text>{workout.name}</Text>
                </TabsTrigger>
              ))}
            </TabsList>
            {routine.workouts.map((workout) => (
              <TabsContent key={workout.id} value={workout.id.toString()} className="w-full">
                <RoutineWorkout workout={workout} exercises={workout.exercises} routineName={routine.name} />
              </TabsContent>
            ))}
          </Tabs>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
