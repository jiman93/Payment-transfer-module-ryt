import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '../store/exports';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, authenticate } = useAuth();

  useEffect(() => {
    const init = async () => {
      // If not authenticated, authenticate automatically
      if (!isAuthenticated) {
        await authenticate();
      }

      // Then redirect to account page
      router.replace('/account');
    };

    init();
  }, []);

  // Return a blank view while redirecting
  return <View className="flex-1 bg-white" />;
}
