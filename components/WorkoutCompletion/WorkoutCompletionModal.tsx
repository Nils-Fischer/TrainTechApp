import React, { useMemo, useRef, useState, useEffect } from "react";
import { View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { H1, H3, P, Large, Small, Muted, CardLabel } from "~/components/ui/typography";
import { Badge } from "~/components/ui/badge";
import { Clock, Weight, Flame, Brain, Sparkles } from "~/lib/icons/Icons";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ScrollView } from "react-native-gesture-handler";
import { Button } from "~/components/ui/button";
import confetti from "~/assets/animations/confetti.json";
import LottieView from "lottie-react-native";
import { ActivityIndicator } from "react-native";
import { MuscleGroup, Routine } from "~/lib/types";
import { Improvement } from "~/app/(tabs)/(dashboard)/workout-completion";

// Array of motivational feedback slogans
const FEEDBACK_SLOGANS = [
  "✨ Super gemacht! ✨️",
  "🔥 Starke Leistung! 🔥",
  "💪 Beeindruckend! 💪",
  "👏 Großartige Arbeit! 👏",
  "🚀 Starkes Training! 🚀",
  "⭐ Hervorragend! ⭐",
  "⚡️ Staaaaaaark! ⚡️",
];

interface WorkoutCompletionModalProps {
  workoutName: string;
  date: Date;
  duration: string;
  totalWeight: number;
  caloriesBurned: number;
  trainedMuscles: MuscleGroup[];
  improvements: Improvement[];
  aiCoachFeedback: Promise<{ text: string; routine?: Routine } | undefined>;
  displayRoutine: (routine: Routine) => void;
  onFinish: () => void;
}

export const WorkoutCompletionModal: React.FC<WorkoutCompletionModalProps> = ({
  workoutName,
  date,
  duration,
  totalWeight,
  caloriesBurned,
  trainedMuscles,
  improvements,
  aiCoachFeedback,
  displayRoutine,
  onFinish,
}) => {
  const animationRef = useRef<any>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch coach feedback when component mounts
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const result = await aiCoachFeedback;
        if (result) {
          setFeedback(result.text);
          result.routine && setRoutine(result.routine);
        } else {
          setFeedback("Feedback konnte nicht geladen werden. Bitte versuche es später erneut.");
        }
      } catch (error) {
        console.error("Failed to fetch AI coach feedback:", error);
        setFeedback("Feedback konnte nicht geladen werden. Bitte versuche es später erneut.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [aiCoachFeedback]);

  // Select a random slogan when the component mounts
  const randomSlogan = useMemo(() => {
    if (animationRef.current) {
      animationRef.current.play();
    }
    const randomIndex = Math.floor(Math.random() * FEEDBACK_SLOGANS.length);
    return FEEDBACK_SLOGANS[randomIndex];
  }, []);

  // Format date as string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <ScrollView>
      {/* Confetti Animation */}
      <View className="absolute top-0 left-0 right-0 z-10 h-80 pointer-events-none">
        <LottieView ref={animationRef} source={confetti} loop={false} autoPlay />
      </View>

      <View className="flex flex-col p-4 gap-6">
        {/* Header */}
        <View className="items-center mt-5 gap-2">
          <H1>{randomSlogan}</H1>
          <H3 className="text-muted-foreground mt-1">{formatDate(date)}</H3>
        </View>

        {/* Main Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>{workoutName}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Stats Row */}
            <View className="flex flex-row justify-between my-4">
              <View className="items-center">
                <View className="flex flex-row items-center">
                  <Clock size={18} className="text-muted-foreground mr-2" />
                  <Large className="text-primary">{duration}</Large>
                </View>
              </View>
              <View className="items-center">
                <View className="flex flex-row items-center">
                  <Weight size={18} className="text-muted-foreground mr-2" />
                  <Large className="text-primary">{totalWeight} kg</Large>
                </View>
              </View>
              <View className="items-center">
                <View className="flex flex-row items-center">
                  <Flame size={18} className="text-muted-foreground mr-2" />
                  <Large className="text-primary">{caloriesBurned} kcal</Large>
                </View>
              </View>
            </View>

            {/* Trained Muscles */}
            <View className="my-4">
              <Small className="text-muted-foreground mb-2">TRAINIERTE MUSKELN</Small>
              <View className="flex flex-row flex-wrap gap-2">
                {trainedMuscles.map((muscle, index) => (
                  <Badge key={index} variant="secondary">
                    <P className="text-secondary-foreground">{muscle}</P>
                  </Badge>
                ))}
              </View>
            </View>
          </CardContent>
        </Card>

        {/* PRs Card */}
        {improvements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>NEUE BESTLEISTUNGEN</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex flex-col gap-2">
                {improvements.map((improvement, index) => (
                  <View key={index} className="flex flex-row items-center">
                    <View className="flex-1 flex-row items-center gap-2">
                      <P>{improvement.exerciseName}</P>
                      {improvement.pr && <CardLabel className="text-success text-sm mt-0.5">NEW PR</CardLabel>}
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Muted>{improvement.weight} kg</Muted>
                      {improvement.percentageImprovement && (
                        <Small className="text-success mt-0.5">{`+${improvement.percentageImprovement.toFixed(
                          1
                        )}%`}</Small>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* AI Coach Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>COACH FEEDBACK</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex flex-row mt-2">
              {/* Avatar */}
              <Avatar className="h-12 w-12 bg-primary" alt={"Athly Avatar"}>
                <AvatarFallback className="bg-accent">
                  <P className="text-accent-foreground text-2xl">A</P>
                </AvatarFallback>
              </Avatar>

              {/* Chat Bubble */}
              <View className="flex-1 ml-3 gap-2">
                {/* Coach Name */}
                <Small className="text-muted-foreground font-medium mb-1">Athly</Small>

                {/* Message Bubble or Loading Indicator */}
                <View className="bg-secondary rounded-2xl rounded-tl-none p-3">
                  {isLoading ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <P className="text-secondary-foreground">{feedback}</P>
                  )}
                </View>
                {routine && (
                  <Button
                    variant="secondary"
                    haptics="light"
                    onPress={() => displayRoutine(routine)}
                    className="w-full rounded-2xl"
                  >
                    <View className="flex-row items-left gap-2">
                      <Sparkles size={18} className="text-secondary-foreground" />
                      <P className="text-secondary-foreground">Optimierte Routine anzeigen</P>
                    </View>
                  </Button>
                )}
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Back to Home Button */}
        <Button variant="default" haptics="heavy" onPress={onFinish} className="py-10 mb-10">
          <Large className="text-primary-foreground font-bold">Fertig</Large>
        </Button>
      </View>
    </ScrollView>
  );
};

export default WorkoutCompletionModal;
