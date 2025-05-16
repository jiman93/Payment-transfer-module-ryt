import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthContext';
import { useAccounts } from '~/contexts/AccountContext';
import Loader from '~/components/Loader';
import { getRecentTransfers } from '~/mocks/transfers';
import RecentTransfers from '~/components/RecentTransfers';

export default function Transfer() {
  const router = useRouter();
  const { auth } = useAuth();
  const { accounts, selectedAccount, loading: transferLoading, refreshAccounts } = useAccounts();

  // Get recent transfers from mock data
  const [recentTransfers, setRecentTransfers] = useState(getRecentTransfers());

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
            className="mr-2 flex-1 items-center justify-center rounded-full bg-primary py-3"
            onPress={handleBankTransfer}>
            <Text className="text-base font-semibold text-white">Bank Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="ml-2 flex-1 items-center justify-center rounded-full bg-primary py-3"
            onPress={handleMobileTransfer}>
            <Text className="text-base font-semibold text-white">Mobile Transfer</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transfers Section */}
        <View className="mt-6 flex-1">
          <Text className="mb-4 text-lg font-bold text-gray-700">Recent Transfers</Text>
          <RecentTransfers recentTransfers={recentTransfers} />
        </View>

        {/* Loading indicator */}
        {transferLoading && <Loader text="Processing transfer..." />}
      </View>
    </SafeAreaView>
  );
}
