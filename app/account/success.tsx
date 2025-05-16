import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';

export default function Success() {
  const router = useRouter();

  // Function to go back to account home
  const handleDone = () => {
    router.replace('/account');
  };

  return (
    <View className="flex-1 bg-white pt-8">
      <View className="flex-1 items-center justify-center px-6">
        {/* Success Animation */}
        <View className="mb-6">
          <LottieView
            source={require('../../assets/success-lottie.json')}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
          />
        </View>

        {/* Success Message */}
        <Text className="mb-2 text-2xl font-bold text-gray-800">Transfer Successful!</Text>
        <Text className="mb-8 text-center text-gray-600">
          Your money transfer has been completed successfully. A receipt has been sent to your
          email.
        </Text>
      </View>

      {/* Done Button */}
      <View className="mb-8 px-6">
        <TouchableOpacity className="w-full rounded-full bg-primary py-4" onPress={handleDone}>
          <Text className="text-center text-base font-semibold text-white">Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
