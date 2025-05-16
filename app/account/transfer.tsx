import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RecentTransfers from '../../components/RecentTransfers';
import { useAccount } from '../../store/exports';
import Loader from '../../components/Loader';
import ErrorScreen from '../../components/ErrorScreen';

export default function Transfer() {
  const router = useRouter();
  const { account, fetchAccount } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fetchCompleted = useRef(false);

  // Load account data
  useEffect(() => {
    const loadAccount = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        await fetchAccount();
        fetchCompleted.current = true;
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching account:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    loadAccount();
  }, []);

  // Check if account data was actually loaded
  useEffect(() => {
    if (fetchCompleted.current && !isLoading && !account) {
      setHasError(true);
    }
  }, [account, isLoading]);

  // Format balance for display
  const formatBalance = (balanceCents: number = 0): string => {
    return (balanceCents / 100).toFixed(2);
  };

  // Navigate to bank transfer page
  const handleBankTransfer = () => {
    router.push('/account/bank-transfer');
  };

  // Navigate to mobile transfer page
  const handleMobileTransfer = () => {
    router.push('/account/mobile-transfer');
  };

  if (isLoading) {
    return <Loader text="Loading account details..." />;
  }

  if (hasError) {
    return (
      <ErrorScreen
        onRetry={async () => {
          setIsLoading(true);
          setHasError(false);
          fetchCompleted.current = false;
          try {
            await fetchAccount();
            fetchCompleted.current = true;
            setIsLoading(false);
          } catch (error) {
            console.error('Error retrying account fetch:', error);
            setHasError(true);
            setIsLoading(false);
          }
        }}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        {/* Account balance */}
        <View className="mt-2 items-center rounded-xl  p-4">
          <Text className="text-base font-semibold text-gray-500">Available Balance</Text>
          <View className="flex-row items-center">
            <Text className="mr-2 text-2xl font-bold">
              RM {showBalance ? formatBalance(account?.balanceCents) : '*****'}
            </Text>
            <TouchableOpacity onPress={() => setShowBalance((v) => !v)}>
              <Ionicons
                name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
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

        <View className="mt-2 flex-1">
          <RecentTransfers />
        </View>
      </View>
    </SafeAreaView>
  );
}
