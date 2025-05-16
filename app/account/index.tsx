import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAccount } from '../../store/exports';
import { Ionicons } from '@expo/vector-icons';
import Loader from '../../components/Loader';

export default function Account() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const { account, fetchAccount } = useAccount();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAccount = async () => {
      setIsLoading(true);
      try {
        await fetchAccount();
      } catch (error) {
        console.error('Error fetching account:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccount();
  }, []);

  // Format balance for display
  const formatBalance = (balanceCents: number = 0): string => {
    return (balanceCents / 100).toFixed(2);
  };

  if (isLoading) {
    return <Loader text="Loading account details..." />;
  }

  return (
    <View className="flex-1 bg-white p-6">
      {/* Simple header */}
      <View className="mb-6 items-center pt-8">
        <Text className="text-2xl font-bold text-gray-800">My Account</Text>
      </View>

      {/* Account details */}
      <View className="mt-5 items-center gap-3">
        <Text className="mb-1 font-semibold text-gray-500">MYR Digital Savings Account</Text>
        <View className="mb-6 flex-row items-center">
          <Text className="mr-2 text-3xl font-bold">
            RM {showBalance ? formatBalance(account?.balanceCents) : '*****'}
          </Text>
          <TouchableOpacity onPress={() => setShowBalance((v) => !v)}>
            <Ionicons
              name={showBalance ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Transfer button */}
      <View className="mt-8 w-full flex-row justify-center">
        <TouchableOpacity
          className="rounded-2xl bg-blue-500 px-6 py-3"
          onPress={() => router.push('/account/transfer')}>
          <Text className="font-bold text-white">Make a Transfer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
