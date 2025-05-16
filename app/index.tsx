import { Text, View, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '~/contexts';
import Loader from '~/components/Loader';
import { DEFAULT_USER } from '~/mocks';

export default function Index() {
  const router = useRouter();
  const { auth, login } = useAuth();
  const [loading, setLoading] = useState(true);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      // Give a moment for the auth context to initialize
      setTimeout(() => {
        if (auth.isAuthenticated) {
          router.replace('/account');
        } else {
          setLoading(false);
        }
      }, 500);
    };
    checkAuth();
  }, [auth.isAuthenticated]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Just use the login function with our default user ID
      await login(DEFAULT_USER.id);
      router.replace('/account');
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text="Loading..." />;
  }

  return (
    <View className="flex-1 bg-white p-6">
      <View className="flex-1 items-center justify-center">
        <Image
          source={require('../assets/rytbank-logo.png')}
          className="mb-10 h-32 w-32"
          resizeMode="contain"
        />
        <Text className="mb-8 text-center text-2xl font-bold text-gray-800">
          Welcome to RytBank
        </Text>
        <Text className="mb-12 text-center text-base text-gray-600">
          Your simplified banking experience starts here
        </Text>
        <TouchableOpacity className="w-full rounded-xl bg-primary p-4" onPress={handleLogin}>
          <Text className="text-center text-lg font-bold text-white">Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
