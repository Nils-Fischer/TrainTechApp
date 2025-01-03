import React from "react";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Level } from "~/lib/types";
import { cn } from "~/lib/utils";
import { Baby, UserCircle, Trophy } from "~/lib/icons/Icons";

interface ExperienceLevelProps {
  level: Level | null;
  onLevelChange: (level: Level | null) => void;
}

export function ExperienceLevel({
  level,
  onLevelChange,
}: ExperienceLevelProps) {
  const options = [
    {
      value: Level.Beginner,
      title: "Anfänger",
      description: "Weniger als 1 Jahr",
      icon: Baby,
    },
    {
      value: Level.Intermediate,
      title: "Fortgeschritten",
      description: "1-3 Jahre",
      icon: UserCircle,
    },
    {
      value: Level.Expert,
      title: "Experte",
      description: "Mehr als 3 Jahre",
      icon: Trophy,
    },
  ];

  return (
    <View className="flex-1 w-full px-4 min-w-[350]">
      <Text className="text-2xl font-bold">
        Wie viel Erfahrung hast du mit Training?
      </Text>
      <Text className="text-base text-muted-foreground mb-6">
        Hilft uns deinen Trainingsplan optimal anzupassen.
      </Text>
      <View className="gap-4 w-full">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={level === option.value ? "default" : "ghost"}
            size="lg"
            className={cn(
              "w-full h-auto p-4 flex-row items-center justify-between",
              level === option.value && "bg-primary"
            )}
            onPress={() => onLevelChange(option.value)}
          >
            <View className="flex-row items-center gap-3 flex-1">
              <option.icon
                size={24}
                className={cn(
                  "text-foreground",
                  level === option.value && "text-primary-foreground"
                )}
              />
              <View className="flex-1 gap-0 mr-3">
                <Text
                  className={cn(
                    "font-semibold",
                    level === option.value && "text-primary-foreground"
                  )}
                >
                  {option.title}
                </Text>
                <Text
                  className={cn(
                    "text-sm text-muted-foreground",
                    level === option.value && "text-primary-foreground/70"
                  )}
                  numberOfLines={2}
                >
                  {option.description}
                </Text>
              </View>
            </View>
          </Button>
        ))}
      </View>
    </View>
  );
}
