// app/(tabs)/(dashboard)/_layout.tsx (previously index folder)
import { Stack } from "expo-router";
import { ThemeToggle } from "~/components/ThemeToggle";

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerRight: () => <ThemeToggle />,
        headerTitle: "Dashboard",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: true }} />
      <Stack.Screen
        name="active-workout"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
