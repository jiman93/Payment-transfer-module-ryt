import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RecentTransfers from '../../components/RecentTransfers';

export default function Transfer() {
  const router = useRouter();

  // Navigate to bank transfer page
  const handleBankTransfer = () => {
    router.push('/account/bank-transfer');
  };

  // Navigate to mobile transfer page
  const handleMobileTransfer = () => {
    router.push('/account/mobile-transfer');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-semibold">Transfer</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Top buttons for initiating transfers */}
        <View className="mb-6 mt-4 flex-row items-center justify-between">
          <TouchableOpacity
            className="mr-2 flex-1 items-center justify-center rounded-full bg-blue-500 py-3"
            onPress={handleBankTransfer}>
            <Text className="text-base font-semibold text-white">Bank Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="ml-2 flex-1 items-center justify-center rounded-full bg-blue-500 py-3"
            onPress={handleMobileTransfer}>
            <Text className="text-base font-semibold text-white">Mobile Transfer</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6 flex-1">
          <RecentTransfers />
        </View>
      </View>
    </SafeAreaView>
  );
}
