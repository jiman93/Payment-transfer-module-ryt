import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTransferForm } from '../../store/exports';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import Loader from '../../components/Loader';

export default function Success() {
  const router = useRouter();
  const { currentTransfer, lastTransfer, resetForm } = useTransferForm();
  const [isLoading, setIsLoading] = useState(true);

  // Give time for AsyncStorage to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);

      // Check if we have transfer data after loading completes
      if (!currentTransfer && !lastTransfer) {
        router.replace('/account/bank-transfer');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentTransfer, lastTransfer, router]);

  // Handle going back to home
  const handleDone = async () => {
    await resetForm();
    router.replace('/account');
  };

  if (isLoading) {
    return <Loader text="Finalizing your transfer..." />;
  }

  // Use either lastTransfer or currentTransfer (preferring lastTransfer)
  const transferData = lastTransfer || currentTransfer;

  if (!transferData) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="mb-4 text-center text-red-500">Transfer information not available</Text>
        <TouchableOpacity
          className="rounded-xl bg-blue-500 px-6 py-3"
          onPress={() => router.replace('/account/bank-transfer')}>
          <Text className="font-medium text-white">Go Back to Transfers</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <LottieView
          source={require('../../assets/success-lottie.json')}
          autoPlay
          loop={false}
          style={{ width: 150, height: 150 }}
        />

        {/* Success Message */}
        <Text className="mt-6 text-center text-2xl font-bold text-gray-800">
          Transfer Successful!
        </Text>

        <Text className="mt-2 text-center text-gray-600">
          Your funds have been transferred successfully.
        </Text>

        {/* Transaction Details */}
        <View className="mt-6 w-full rounded-xl bg-gray-50 p-5">
          <Text className="mb-4 text-center text-lg font-medium">Transaction Details</Text>

          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Reference</Text>
              <Text className="font-medium">{transferData.reference || 'N/A'}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-500">Amount</Text>
              <Text className="font-medium">
                RM {parseFloat(transferData.amount || '0').toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-500">Recipient</Text>
              <Text className="font-medium">{transferData.recipientName || 'N/A'}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-500">Date</Text>
              <Text className="font-medium">{new Date().toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View className="mt-12 w-full gap-4">
          <TouchableOpacity className="w-full rounded-full bg-blue-500 py-4" onPress={handleDone}>
            <Text className="text-center font-semibold text-white">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
