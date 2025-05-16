import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';

type ErrorScreenProps = {
  message?: string;
  onRetry?: () => void;
  buttonText?: string;
};

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
  buttonText = 'Try Again',
}) => {
  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      <LottieView
        source={require('../assets/error-lottie.json')}
        autoPlay
        loop={false}
        style={{ width: 400, height: 400 }}
      />

      <Text className="mb-6 text-center text-lg font-semibold text-gray-700">{message}</Text>

      <View className="w-full space-y-4">
        {onRetry && (
          <TouchableOpacity className="w-full rounded-full bg-primary py-4" onPress={onRetry}>
            <Text className="text-center font-semibold text-white">{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ErrorScreen;
