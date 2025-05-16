import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Container } from '~/components/Container';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth, useAccounts } from '~/contexts';
import Loader from '~/components/Loader';

export default function Account() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const { auth, logout } = useAuth();
  const { accounts, selectedAccount, loading, error, refreshAccounts } = useAccounts();

  useEffect(() => {
    if (auth.isAuthenticated) {
      refreshAccounts();
    }
  }, [auth.isAuthenticated]);

  // Format balance for display
  const formatBalance = (balanceCents: number = 0): string => {
    return (balanceCents / 100).toFixed(2);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
        style: 'destructive',
      },
    ]);
  };

  if (loading) {
    return <Loader text="Loading account details..." />;
  }

  if (error) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className="mb-4 text-red-500">{error}</Text>
          <TouchableOpacity
            className="rounded-lg bg-primary px-4 py-2"
            onPress={() => refreshAccounts()}>
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <View className="mb-6 w-full flex-row items-center justify-between px-6 pt-8">
        <View className="flex-row items-center">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Text className="text-xl font-bold text-white">
              {auth.userId ? auth.userId.charAt(0).toUpperCase() : 'G'}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-gray-400">Welcome back,</Text>
            <Text className="text-lg font-bold text-gray-800">
              {auth.userId ? `User ${auth.userId.substring(0, 5)}` : 'Guest'}
            </Text>
          </View>
        </View>
        <View className="flex-row">
          <TouchableOpacity className="mr-4">
            <Ionicons name="notifications-outline" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="mt-5 items-center gap-3">
        <Text className="mb-1 font-semibold text-gray-500">
          {selectedAccount
            ? `${selectedAccount.currency} Digital Savings Account`
            : 'No Account Selected'}
        </Text>
        <View className="mb-2 flex-row items-center">
          <Text className="mr-2 text-3xl font-bold">
            {selectedAccount?.currency || 'RM'}{' '}
            {showBalance ? formatBalance(selectedAccount?.balanceCents) : '*****'}
          </Text>
          <TouchableOpacity onPress={() => setShowBalance((v) => !v)}>
            <Ionicons
              name={showBalance ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        <View className="flex items-center">
          <Text className="mb-1 text-sm tracking-widest text-gray-400">
            {selectedAccount?.accountNo || '---- ---- ----'}
          </Text>
          <View className="mb-4 flex-row items-center">
            <MaterialIcons name="verified-user" size={16} color="" />
            <Text className="ml-1 text-xs text-gray-400">
              Protected by PIDM up to RM 250,000 for each depositor.
            </Text>
          </View>
        </View>
        <View className="mb-8 w-full flex-row justify-between px-6">
          <View className="flex-1 items-center">
            <TouchableOpacity
              className="mb-1 inline-flex w-full flex-row items-center justify-center rounded-2xl bg-primary p-3"
              onPress={() => router.push('/account/transfer')}
              disabled={!selectedAccount}>
              <Text className="mr-2 font-bold text-white">Transfer</Text>
              <MaterialIcons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Container>
  );
}
