import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import Loader from '../../components/Loader';

export default function Review() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { recipientBank, accountNumber, transactionType, amount, reference, note } = params;

  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    setIsLoading(true);

    // Simulate processing time
    setTimeout(() => {
      // Navigate to success page (you can create this later)
      router.push('/account/success');
      setIsLoading(false);
    }, 2000);
  };

  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 'RM 0.00';
    return `RM ${numAmount.toFixed(2)}`;
  };

  return (
    <View className="flex-1 bg-white pt-8">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-4 pt-8">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-semibold">Review Transfer</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Amount */}
        <View className="my-6 items-center">
          <Text className="text-3xl font-bold text-gray-800">{formatAmount(amount as string)}</Text>
          <Text className="mt-1 text-gray-500">Transfer Amount</Text>
        </View>

        {/* Card Section */}
        <View className="my-4 rounded-2xl bg-gray-50 p-5">
          <Text className="mb-4 text-lg font-semibold">Transfer Details</Text>

          {/* Recipient Details */}
          <View className="mb-4 border-b border-gray-200 pb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-500">Recipient</Text>
                <Text className="text-base font-semibold">JOHN DOE</Text>
                <Text className="text-sm text-gray-700">
                  {accountNumber} • {recipientBank}
                </Text>
                <Text className="text-sm text-gray-500">{transactionType}</Text>
              </View>
              <Image
                source={require('../../assets/duitnow-logo.png')}
                style={{ width: 40, height: 40, resizeMode: 'contain' }}
              />
            </View>
          </View>

          {/* Transaction Details */}
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Reference</Text>
              <Text className="font-medium">{reference || 'Not provided'}</Text>
            </View>

            {note && (
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Note</Text>
                <Text className="font-medium">{note}</Text>
              </View>
            )}

            <View className="flex-row justify-between">
              <Text className="text-gray-500">Date</Text>
              <Text className="font-medium">{new Date().toLocaleDateString()}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-500">Transfer Fee</Text>
              <Text className="font-medium">RM 0.00</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View className="mb-20 mt-4 rounded-xl bg-blue-50 p-4">
          <Text className="text-sm text-gray-600">
            By confirming this transfer, you agree to our terms and conditions. This transaction
            will be processed immediately and cannot be reversed.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="absolute bottom-8 left-0 right-0 flex-row gap-3 px-4">
        <TouchableOpacity
          className="flex-1 rounded-full border border-gray-300 py-4"
          onPress={() => router.back()}>
          <Text className="text-center text-base font-semibold text-gray-700">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 rounded-full bg-primary py-4" onPress={handleConfirm}>
          <Text className="text-center text-base font-semibold text-white">Confirm</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Spinner Overlay */}
      {isLoading && <Loader text="Processing transfer..." />}
    </View>
  );
}
