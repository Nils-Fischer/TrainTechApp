import * as React from "react";
import { View, ScrollView, TextInput, KeyboardAvoidingView, Platform, Keyboard, Image as RNImage } from "react-native";
import { ChatMessage } from "~/lib/types";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { TypingIndicator } from "./TypingIndicator";
import { Routine } from "~/lib/types";
import { CustomDropdownMenu } from "~/components/ui/custom-dropdown-menu";
import { Camera, Image, Plus } from "~/lib/icons/Icons";
import { CameraView } from "./CameraView";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { LOADING_SPINNER } from "~/assets/svgs";
import { ChatMessage as ChatMessageUI } from "./ChatMessage";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (message: string, image: string[]) => Promise<void>;
  showRoutine?: (routine: Routine) => void;
  deleteMessage: (messageId: string) => void;
  resendMessage: (messageId: string) => void;
}

export default function ChatInterface({
  messages,
  isTyping,
  onSendMessage,
  showRoutine,
  deleteMessage,
  resendMessage,
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = React.useState("");
  const scrollViewRef = React.useRef<ScrollView>(null);
  const inputRef = React.useRef<TextInput>(null);
  const [showCamera, setShowCamera] = React.useState(false);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);

  // Keyboard handling
  React.useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      scrollToBottom();
    });
    return () => showSubscription.remove();
  }, []);

  const scrollToBottom = React.useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = React.useCallback(() => {
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage.trim(), capturedImage ? [capturedImage] : []);
    setInputMessage("");
    setCapturedImage(null);
    inputRef.current?.blur();
  }, [inputMessage, onSendMessage]);

  const imageOptions = [
    {
      name: "Take Photo",
      icon: Camera,
      onPress: () => {
        setShowCamera(true);
      },
    },
    {
      name: "Upload Image",
      icon: Image,
      onPress: openGallery,
    },
  ];

  async function openGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.5,
      exif: false,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      addPictureToMessage(result.assets[0].uri);
    }
  }

  const addPictureToMessage = async (uri: string) => {
    setCapturedImage(uri);
    try {
      const manipResult = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 800 } }], {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      });
      if (!manipResult.base64) throw new Error("Image compression failed");

      setCapturedImage(`data:image/jpeg;base64,${manipResult.base64}`);
    } catch (error) {
      setCapturedImage(null);
      console.error("Image manipulation failed", error);
    }
  };

  if (showCamera) {
    return (
      <CameraView
        onCancel={() => setShowCamera(false)}
        onUsePhoto={(uri) => {
          setShowCamera(false);
          addPictureToMessage(uri);
        }}
        switchToGallery={() => {
          setShowCamera(false);
          openGallery();
        }}
      />
    );
  }

  return (
    <View className="flex-1 bg-background relative z-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
        >
          {messages.map((message, index) => (
            <ChatMessageUI
              key={message.id}
              message={message}
              showRoutine={showRoutine ?? (() => {})}
              deleteMessage={() => deleteMessage(message.id)}
              resendMessage={() => resendMessage(message.id)}
            />
          ))}
          {isTyping && <TypingIndicator />}
        </ScrollView>

        <View className="px-4 py-2 border-t border-border bg-background rounded-t-2xl">
          {capturedImage && (
            <View className="mb-2 flex-row items-center">
              <View className="relative">
                <RNImage
                  source={{
                    uri: capturedImage !== "" ? capturedImage : LOADING_SPINNER,
                  }}
                  className="w-20 h-20 rounded-lg"
                />
                <Button
                  size="icon"
                  variant="default"
                  className="absolute -top-2 -right-2 w-6 h-6"
                  onPress={() => setCapturedImage(null)}
                >
                  <Text className="text-xs">✕</Text>
                </Button>
              </View>
            </View>
          )}
          <View className="flex-row items-center gap-2">
            <CustomDropdownMenu
              items={imageOptions}
              trigger={
                <Button size="icon" variant="ghost" className="px-0 mx-0">
                  <Plus size={30} className="text-foreground" />
                </Button>
              }
              side="top"
              align="end"
            />
            <View className="flex-1 bg-muted rounded-lg overflow-hidden">
              <TextInput
                ref={inputRef}
                className="px-4 py-2.5 text-base text-foreground min-h-[44px]"
                placeholder="Schreibe eine Nachricht..."
                placeholderTextColor="#666"
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline={false}
                maxLength={500}
                style={{ maxHeight: 120 }}
                keyboardType="default"
                returnKeyType="send"
                onSubmitEditing={() => {
                  if (isTyping || !inputMessage.trim() || capturedImage === "") return;
                  handleSend();
                }}
              />
            </View>
            <Button
              size="icon"
              variant={inputMessage.trim() ? "default" : "secondary"}
              onPress={handleSend}
              disabled={isTyping || !inputMessage.trim() || capturedImage === ""}
            >
              <Text className={`text-lg ${!inputMessage.trim() ? "opacity-50" : ""}`}>➤</Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
