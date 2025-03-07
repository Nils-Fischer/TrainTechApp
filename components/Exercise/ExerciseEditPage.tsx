import React, { useRef, useEffect } from "react";
import {
  View,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  findNodeHandle,
} from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Plus, Minus, Timer, BarChart2, Repeat, ChevronRight, FileText, Info } from "~/lib/icons/Icons";
import { Exercise, WorkoutExercise, SetConfiguration } from "~/lib/types";
import { Separator } from "~/components/ui/separator";
import { ExerciseOverviewCard } from "~/components/Exercise/ExerciseOverviewCard";
import { ExerciseBottomSheetHeader } from "~/components/Exercise/ExerciseBottomSheetHeader";
import * as Haptics from "expo-haptics";
import { Input } from "~/components/ui/input";

export interface ExerciseEditPageProps {
  exercise: Exercise;
  workoutExercise: WorkoutExercise;
  onSave: (exercise: WorkoutExercise) => void;
  onClose: () => void;
  navigateToExerciseDetails: (workoutExercise: WorkoutExercise) => void;
  navigateToNotes: (workoutExercise: WorkoutExercise) => void;
  navigateToAlternativeExercises: (workoutExercise: WorkoutExercise) => void;
  navigateToStats: (workoutExercise: WorkoutExercise) => void;
}

export const ExerciseEditPage: React.FC<ExerciseEditPageProps> = ({
  exercise,
  workoutExercise,
  onSave,
  onClose,
  navigateToExerciseDetails,
  navigateToNotes,
  navigateToAlternativeExercises,
  navigateToStats,
}) => {
  const [setConfigs, setSetConfigs] = React.useState<SetConfiguration[]>(workoutExercise.sets);
  const [restTime, setRestTime] = React.useState(workoutExercise.restPeriod || 120);
  const scrollViewRef = useRef<ScrollView>(null);

  const getNewWorkoutExercise = (): WorkoutExercise => ({
    ...workoutExercise,
    sets: setConfigs,
    restPeriod: restTime,
  });

  const addSet = () => {
    if (setConfigs.length >= 10) return;
    const lastSet = setConfigs[setConfigs.length - 1];
    setSetConfigs([...setConfigs, { reps: lastSet?.reps || 12, weight: lastSet?.weight }]);
  };

  const removeSet = () => {
    if (setConfigs.length <= 1) return;
    setSetConfigs(setConfigs.slice(0, -1));
  };

  const updateSetReps = (index: number, reps: number) => {
    const newConfigs = [...setConfigs];
    newConfigs[index] = { ...newConfigs[index], reps: Math.min(Math.max(1, reps), 30) };
    setSetConfigs(newConfigs);
  };

  const updateSetWeight = (index: number, weight: number) => {
    const newConfigs = [...setConfigs];
    newConfigs[index] = { ...newConfigs[index], weight };
    setSetConfigs(newConfigs);
  };

  const save = () => onSave(getNewWorkoutExercise());

  const goToExerciseDetails = () => navigateToExerciseDetails(getNewWorkoutExercise());
  const goToNotes = () => navigateToNotes(getNewWorkoutExercise());
  const goToAlternativeExercises = () => navigateToAlternativeExercises(getNewWorkoutExercise());
  const goToStats = () => navigateToStats(getNewWorkoutExercise());

  const adjustValue = (type: "sets" | "reps" | "rest", increment: boolean) => {
    switch (type) {
      case "sets":
        if (increment && setConfigs.length < 10) {
          const lastSet = setConfigs[setConfigs.length - 1];
          setSetConfigs([...setConfigs, { reps: lastSet?.reps || 12, weight: lastSet?.weight }]);
        } else if (!increment && setConfigs.length > 1) {
          setSetConfigs(setConfigs.slice(0, -1));
        }
        break;
      case "reps":
        setSetConfigs(
          setConfigs.map((set) => ({
            ...set,
            reps: Math.min(Math.max(1, set.reps + (increment ? 1 : -1)), 30),
          }))
        );
        break;
      case "rest":
        setRestTime(Math.min(Math.max(30, restTime + (increment ? 15 : -15)), 180));
        break;
    }
  };

  const handleInputFocus = (y: number) => {
    // When an input is focused, scroll to make sure it's visible
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: y - 150, animated: true });
    }
  };

  return (
    <ExerciseBottomSheetHeader title="Übung bearbeiten" onClose={onClose} onSave={save}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 bg-background"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="p-4">
            <ExerciseOverviewCard exercise={exercise} onPress={goToExerciseDetails} />

            {/* Rest Time */}
            <View className="mt-6">
              <Text className="text-base font-medium text-muted-foreground mb-2">Pausenzeit</Text>
              <View className="flex-row items-center justify-between bg-secondary/10 p-4 rounded-xl shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => adjustValue("rest", false)}
                  className="h-11 w-11 bg-background/50 rounded-lg"
                  haptics="light"
                >
                  <Minus size={20} className="text-foreground" />
                </Button>
                <View className="bg-background/50 px-4 py-2 rounded-lg flex-row items-center gap-2">
                  <Timer size={20} className="text-muted-foreground" />
                  <Input
                    className="text-xl font-semibold text-center max-w-40 p-0 h-9 text-primary"
                    value={restTime.toString()}
                    onChangeText={(text) => setRestTime(parseInt(text) || restTime)}
                    keyboardType="number-pad"
                    onFocus={(e) => {
                      const target = e.target as unknown as {
                        measure?: (
                          callback: (
                            x: number,
                            y: number,
                            width: number,
                            height: number,
                            pageX: number,
                            pageY: number
                          ) => void
                        ) => void;
                      };
                      target.measure?.((x, y, width, height, pageX, pageY) => {
                        handleInputFocus(pageY);
                      });
                    }}
                  />
                  <Text className="text-lg text-muted-foreground">s</Text>
                </View>
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => adjustValue("rest", true)}
                  className="h-11 w-11 bg-background/50 rounded-lg"
                  haptics="light"
                >
                  <Plus size={20} className="text-foreground" />
                </Button>
              </View>
            </View>

            {/* Sets Counter */}
            <View className="my-6">
              <Text className="text-base font-medium text-muted-foreground mb-2">Sätze</Text>
              <View className="flex-row items-center justify-between bg-secondary/10 p-4 rounded-xl shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={removeSet}
                  className="h-11 w-11 bg-background/50 rounded-lg"
                  haptics="light"
                >
                  <Minus size={20} className="text-foreground" />
                </Button>
                <Text className="text-3xl font-semibold text-center text-primary">{setConfigs.length}</Text>
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={addSet}
                  className="h-11 w-11 bg-background/50 rounded-lg"
                  haptics="light"
                >
                  <Plus size={20} className="text-foreground" />
                </Button>
              </View>
            </View>

            {/* Set Configurations */}
            {setConfigs.map((set, index) => (
              <View key={index} className="mb-3 bg-muted rounded-xl p-3">
                <View className="flex-row items-center">
                  <Text className="text-bold font-medium text-muted-foreground w-8">{index + 1}</Text>

                  {/* Reps Input Group */}
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-muted-foreground">Wiederholungen</Text>
                    </View>
                    <View className="flex-row items-center justify-between mt-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onPress={() => updateSetReps(index, set.reps - 1)}
                        className="h-9 w-9 rounded-lg bg-background/50"
                        haptics="light"
                      >
                        <Minus size={16} className="text-foreground" />
                      </Button>
                      <Input
                        className="text-base font-semibold text-center max-w-20 h-9 p-0"
                        value={set.reps.toString().trim()}
                        onChangeText={(text) => updateSetReps(index, parseInt(text) || set.reps)}
                        keyboardType="number-pad"
                        onFocus={(e) => {
                          const target = e.target as unknown as {
                            measure?: (
                              callback: (
                                x: number,
                                y: number,
                                width: number,
                                height: number,
                                pageX: number,
                                pageY: number
                              ) => void
                            ) => void;
                          };
                          target.measure?.((x, y, width, height, pageX, pageY) => {
                            handleInputFocus(pageY);
                          });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onPress={() => updateSetReps(index, set.reps + 1)}
                        className="h-9 w-9 rounded-lg bg-background/50"
                        haptics="light"
                      >
                        <Plus size={16} className="text-foreground" />
                      </Button>
                    </View>
                  </View>

                  {/* Weight Input Group */}
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-muted-foreground">Gewicht (kg)</Text>
                    </View>
                    <View className="flex-row items-center justify-center mt-1">
                      <Input
                        className="text-base font-semibold text-center text-primary rounded-lg max-w-35 h-9 p-0"
                        value={set.weight?.toString() || ""}
                        onChangeText={(text) => updateSetWeight(index, parseFloat(text) || 0)}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        onFocus={(e) => {
                          const target = e.target as unknown as {
                            measure?: (
                              callback: (
                                x: number,
                                y: number,
                                width: number,
                                height: number,
                                pageX: number,
                                pageY: number
                              ) => void
                            ) => void;
                          };
                          target.measure?.((x, y, width, height, pageX, pageY) => {
                            handleInputFocus(pageY);
                          });
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}

            <Separator className="my-6" />
            <Text className="text-base font-medium mb-4">Weitere Optionen</Text>
            {/* View Exercise Details */}
            <Pressable
              className="flex-row items-center justify-between p-4 bg-secondary/10 rounded-lg mb-3 active:opacity-70"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                goToExerciseDetails();
              }}
            >
              <View className="flex-row items-center">
                <Info size={20} className="text-foreground mr-3" />
                <View>
                  <Text className="font-medium">Übung ansehen</Text>
                  <Text className="text-sm text-muted-foreground">Details & Ausführung</Text>
                </View>
              </View>
              <ChevronRight size={20} className="text-muted-foreground" />
            </Pressable>
            {/* Fortschritt & Ziele */}
            <Pressable
              className="flex-row items-center justify-between p-4 bg-secondary/10 rounded-lg mb-3 active:opacity-70"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                goToStats();
              }}
            >
              <View className="flex-row items-center">
                <BarChart2 size={20} className="text-foreground mr-3" />
                <View>
                  <Text className="font-medium">Fortschritt & Ziele</Text>
                  <Text className="text-sm text-muted-foreground">Verlauf und Zielgewichte festlegen</Text>
                </View>
              </View>
              <ChevronRight size={20} className="text-muted-foreground" />
            </Pressable>
            {/* Alternative Exercise */}
            <Pressable
              className="flex-row items-center justify-between p-4 bg-secondary/10 rounded-lg mb-3 active:opacity-70"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                goToAlternativeExercises();
              }}
            >
              <View className="flex-row items-center">
                <Repeat size={20} className="text-foreground mr-3" />
                <View>
                  <Text className="font-medium">Alternative Übungen</Text>
                  <Text className="text-sm text-muted-foreground">Ähnliche Übungen verwalten</Text>
                </View>
              </View>
              <ChevronRight size={20} className="text-muted-foreground" />
            </Pressable>
            {/* Exercise Notes Pressable */}
            <Pressable
              className="flex-row items-center justify-between p-4 bg-secondary/10 rounded-lg mb-6 active:opacity-70"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                goToNotes();
              }}
            >
              <View className="flex-row items-center">
                <FileText size={20} className="text-foreground mr-3" />
                <View>
                  <Text className="font-medium">Notizen</Text>
                  <Text className="text-sm text-muted-foreground">Notizen bearbeiten</Text>
                </View>
              </View>
              <View className="h-2 w-2 rounded-full bg-primary mr-2" />
              <ChevronRight size={20} className="text-muted-foreground" />
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ExerciseBottomSheetHeader>
  );
};

// Add display name for debugging
ExerciseEditPage.displayName = "ExerciseEditPage";
