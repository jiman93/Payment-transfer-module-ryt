import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';

type ErrorScreenProps = {
  message?: string;
  onRetry?: () => void;
};

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
}) => {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/account');
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      <LottieView
        source={require('../assets/error-lottie.json')}
        autoPlay
        loop={false}
        style={{ width: 200, height: 200 }}
      />

      <View className="w-full space-y-4">
        {onRetry && (
          <TouchableOpacity className="w-full rounded-full bg-blue-500 py-4" onPress={onRetry}>
            <Text className="text-center font-semibold text-white">Try Again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity className="w-full rounded-full bg-red-500 py-4" onPress={handleGoHome}>
          <Text className="text-center font-semibold text-white">Go to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ErrorScreen;
