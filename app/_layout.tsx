import '../global.css';
import { Stack } from 'expo-router';
import { AppProvider } from '../contexts';

export default function Layout() {
  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AppProvider>
  );
}
