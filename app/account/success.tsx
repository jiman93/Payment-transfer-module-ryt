import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Success() {
  const router = useRouter();

  // Function to go back to account home
  const handleDone = () => {
    router.replace('/account');
  };

  return (
    <View className="flex-1 bg-white pt-8">
      <View className="flex-1 items-center justify-center px-6">
        {/* Success Icon */}
        <View className="mb-6 rounded-full bg-green-100 p-4">
          <Ionicons name="checkmark-circle" size={60} color="#22c55e" />
        </View>

        {/* Success Message */}
        <Text className="mb-2 text-2xl font-bold text-gray-800">Transfer Successful!</Text>
        <Text className="mb-8 text-center text-gray-600">
          Your money transfer has been completed successfully. A receipt has been sent to your
          email.
        </Text>

        {/* Animation or Image could go here */}
        <Image
          source={require('../../assets/adaptive-icon.png')}
          style={{ width: 200, height: 200, resizeMode: 'contain' }}
        />
      </View>

      {/* Done Button */}
      <View className="mb-8 px-6">
        <TouchableOpacity className="bg-primary w-full rounded-full py-4" onPress={handleDone}>
          <Text className="text-center text-base font-semibold text-white">Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
