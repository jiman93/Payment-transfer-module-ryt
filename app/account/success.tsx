import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransfer } from '~/contexts';

export default function Success() {
  const router = useRouter();
  const { transfer, clearCurrentTransfer } = useTransfer();

  // Handle going back to home
  const handleDone = () => {
    clearCurrentTransfer();
    router.replace('/account');
  };

  return (
    <View className="flex-1 bg-white pt-8">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-4 pt-8">
        <View style={{ width: 24 }} />
        <Text className="flex-1 text-center text-xl font-semibold">Transfer Complete</Text>
        <View style={{ width: 24 }} />
      </View>

      <View className="flex-1 items-center justify-center px-4">
        {/* Success Animation */}
        <View className="h-32 w-32 items-center justify-center rounded-full bg-green-100">
          <Ionicons name="checkmark" size={64} color="#10B981" />
        </View>

        {/* Success Message */}
        <Text className="mt-6 text-center text-2xl font-bold text-gray-800">
          Transfer Successful!
        </Text>

        <Text className="mt-2 text-center text-gray-600">
          Your funds have been transferred successfully.
        </Text>

        {/* Transaction Details */}
        {transfer.currentTransfer && (
          <View className="mt-6 w-full rounded-xl bg-gray-50 p-5">
            <Text className="mb-4 text-center text-lg font-medium">Transaction Details</Text>

            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Reference</Text>
                <Text className="font-medium">
                  {transfer.currentTransfer.referenceCode || 'N/A'}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-500">Amount</Text>
                <Text className="font-medium">
                  RM {(transfer.currentTransfer.amountCents / 100).toFixed(2)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-500">Date</Text>
                <Text className="font-medium">
                  {new Date(transfer.currentTransfer.initiatedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action buttons */}
        <View className="mt-12 w-full gap-4">
          <TouchableOpacity className="w-full rounded-full bg-primary py-4" onPress={handleDone}>
            <Text className="text-center font-semibold text-white">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
