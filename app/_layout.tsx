import '../global.css';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { disableErrorOverlay } from '../utils/disableErrorOverlay';

export default function Layout() {
  useEffect(() => {
    // Disable the error overlay in development
    disableErrorOverlay();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
