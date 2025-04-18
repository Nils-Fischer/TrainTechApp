import { CoreMessage, FilePart, ImagePart, TextPart } from "ai";
import { randomUUID } from "expo-crypto";
import { ChatMessage, UserChatMessage, WorkoutSession } from "../types";
import * as FileSystem from "expo-file-system";

export async function createUserMessage(
  message: string,
  images: string[],
  audioUrl?: string
): Promise<UserChatMessage> {
  const text: TextPart = { type: "text", text: message };
  const image: ImagePart[] = images.map((image) => ({ type: "image", image }));

  // Process audio if provided
  let content: (TextPart | ImagePart | FilePart)[] = [text, ...image];
  if (audioUrl) {
    const audioPart = await audioUrlToFilePart(audioUrl);
    content.push(audioPart);
  }

  return {
    id: randomUUID(),
    createdAt: new Date(),
    role: "user",
    message: message,
    images: images,
    technicalMessage: {
      role: "user",
      content: content,
    },
    status: "sent",
    audioUrl: audioUrl,
  };
}

/**
 * Converts an audio URL to a base64 FilePart for API upload
 * @param audioURL Local file URL of the audio recorded with Expo Audio
 * @returns A FilePart object with base64 data and mime type
 */
async function audioUrlToFilePart(audioURL: string): Promise<FilePart> {
  console.log("Exporting audio to file part");
  try {
    // Check if the file exists
    const fileInfo = await FileSystem.getInfoAsync(audioURL);
    if (!fileInfo.exists) {
      throw new Error("Audio-Datei existiert nicht");
    }

    // Read the file as base64
    const base64Audio = await FileSystem.readAsStringAsync(audioURL, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log("Base64 audio:", base64Audio);

    return {
      type: "file",
      data: base64Audio,
      mimeType: "audio/aac",
    };
  } catch (error) {
    console.error("Fehler beim Konvertieren der Audio-Datei:", error);
    throw error;
  }
}

export { audioUrlToFilePart };

export function createWorkoutReviewMessage(session: WorkoutSession): UserChatMessage {
  const sessionAsText: TextPart = { type: "text", text: JSON.stringify(session, null, 2) };
  return {
    id: randomUUID(),
    createdAt: new Date(),
    role: "user",
    message: "Mein heutiges Training",
    images: [],
    workoutSession: session,
    technicalMessage: {
      role: "user",
      content: [sessionAsText],
    },
    status: "sent",
  };
}

export function formatAudioTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export async function saveAudioPermanently(temporaryAudioUri: string): Promise<string> {
  try {
    // Create a permanent directory for audio files if it doesn't exist
    const audioDirectory = `${FileSystem.documentDirectory}audio/`;
    const dirInfo = await FileSystem.getInfoAsync(audioDirectory);

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(audioDirectory, { intermediates: true });
    }

    // Generate a unique filename for the audio
    const filename = `audio-${Date.now()}.aac`;
    const permanentUri = `${audioDirectory}${filename}`;

    // Copy the file from temporary to permanent location
    await FileSystem.copyAsync({
      from: temporaryAudioUri,
      to: permanentUri,
    });

    // Delete the temporary file to free up space
    await FileSystem.deleteAsync(temporaryAudioUri);

    return permanentUri;
  } catch (error) {
    console.error("Fehler beim Speichern der Audio-Datei:", error);
    throw error;
  }
}

export async function getMessageSuggestions(
  messages: ChatMessage[],
  userInfo: string,
  chatContext?: string
): Promise<string[]> {
  const lastMessages = messages.slice(-5);
  const lastTechnicalMessages: CoreMessage[] = lastMessages.map((message) => message.technicalMessage).flat();

  try {
    const response = await fetch("https://api-proxy-worker.nils-fischer7.workers.dev/api/message-suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "google",
        messages: lastTechnicalMessages,
        userInfo: userInfo,
        lastMessageTime: lastMessages.at(-1)?.createdAt,
        chatContext: chatContext,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Error getting message suggestions: ${response.status} ${response.statusText}`, errorData);
      return [];
    }

    const data = await response.json();
    console.log("Message suggestions response data:", data);

    if (Array.isArray(data) && data.every((item) => typeof item === "string")) {
      return data as string[];
    } else if (
      data.response &&
      Array.isArray(data.response.suggestions) &&
      data.response.suggestions.every((item: any) => typeof item === "string")
    ) {
      return data.response.suggestions as string[];
    } else {
      console.error("Error getting message suggestions: Invalid response format.", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching or processing message suggestions:", error);
    return [];
  }
}
