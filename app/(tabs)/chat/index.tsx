import * as React from "react";
import { View } from "react-native";
import { useEffect, useRef } from "react";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import ChatInterface from "~/components/Chat/chatinterface";
import { Routine, WorkoutSession } from "~/lib/types";
import { useChatStore } from "~/stores/chatStore";
import { useUserRoutineStore } from "~/stores/userRoutineStore";
import { useUserProfileStore } from "~/stores/userProfileStore";
import { RoutinePreview } from "~/lib/Chat/RoutinePreview";
import WorkoutSessionLog from "~/components/WorkoutCompletion/WorkoutLogOverview";
import { getMessageSuggestions } from "~/lib/Chat/chatUtils";

export default function ChatScreen() {
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const { messages, sendChatMessage: sendMessage, deleteMessage, resendMessage, clearMessages } = useChatStore();
  const { addRoutine, updateRoutine } = useUserRoutineStore();
  const routines = useUserRoutineStore((state) => state.routines);
  const { profile } = useUserProfileStore();
  const [isTyping, setIsTyping] = React.useState(false);

  const [previewContent, setPreviewContent] = React.useState<"routine" | "workoutSession" | null>(null);
  const [previewRoutine, setPreviewRoutine] = React.useState<Routine | null>(null);
  const [previewWorkoutSessionLog, setPreviewWorkoutSessionLog] = React.useState<WorkoutSession | null>(null);
  const [messageSuggestions, setMessageSuggestions] = React.useState<string[]>([]);

  const showPreviewRoutine = (routine: Routine) => {
    setPreviewRoutine(routine);
    setPreviewContent("routine");
    actionSheetRef.current?.show();
  };

  const showPreviewWorkoutSessionLog = (workoutSession: WorkoutSession) => {
    setPreviewWorkoutSessionLog(workoutSession);
    setPreviewContent("workoutSession");
    actionSheetRef.current?.show();
  };

  const handleSendMessage = async (message: string, images: string[], audioUrl?: string): Promise<void> => {
    try {
      setMessageSuggestions([]);
      setIsTyping(true);
      await sendMessage(message, images || [], routines, JSON.stringify(profile, null, 2), audioUrl).then(() =>
        setIsTyping(false)
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0 && messages.at(-1)?.role === "assistant") {
      console.log("Getting message suggestions", messages.at(-1)?.message);
      getMessageSuggestions(messages, JSON.stringify(profile, null, 2)).then((suggestions) => {
        setMessageSuggestions(suggestions);
      });
    }
  }, [messages.at(-1)?.technicalMessage]);

  const handleResendMessage = async (messageId: string) => {
    try {
      setIsTyping(true);
      await resendMessage(messageId, routines, JSON.stringify(profile, null, 2)).then(() => setIsTyping(false));
    } catch (error) {
      console.error("Error resending message:", error);
      setIsTyping(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ChatInterface
        messages={messages}
        messageSuggestions={messageSuggestions}
        isTyping={isTyping}
        onSendMessage={handleSendMessage}
        showPreviewRoutine={showPreviewRoutine}
        showPreviewWorkoutSessionLog={showPreviewWorkoutSessionLog}
        deleteMessage={deleteMessage}
        resendMessage={handleResendMessage}
      />

      <ActionSheet
        ref={actionSheetRef}
        snapPoints={[95]}
        initialSnapIndex={0}
        gestureEnabled={true}
        closeOnTouchBackdrop={true}
        elevation={2}
      >
        {previewContent === "routine" && previewRoutine && (
          <RoutinePreview
            allRoutines={routines}
            previewRoutine={previewRoutine}
            handleAddRoutine={addRoutine}
            handleModifyRoutine={updateRoutine}
          />
        )}
        {previewContent === "workoutSession" && previewWorkoutSessionLog && (
          <WorkoutSessionLog workout={previewWorkoutSessionLog} />
        )}
      </ActionSheet>
    </View>
  );
}
