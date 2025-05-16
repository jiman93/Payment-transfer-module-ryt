import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="account/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="account/_layout" options={{ headerShown: false }} />
    </Stack>
  );
}
