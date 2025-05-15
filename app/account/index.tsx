import { View, Text, TouchableOpacity } from 'react-native';
import { Container } from '~/components/Container';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function Account() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  return (
    <Container>
      {/* Header */}
      <View className="mb-6 w-full flex-row items-center justify-between px-6 pt-8">
        <View className="flex-row items-center">
          <View className="bg-primary mr-3 h-12 w-12 items-center justify-center rounded-full">
            <Text className="text-xl font-bold text-white">Z</Text>
          </View>
          <View>
            <Text className="text-xs text-gray-400">Welcome back,</Text>
            <Text className="text-lg font-bold text-gray-800">Zulhafiz</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>
      <View className="mt-5 items-center gap-3">
        <Text className="mb-1 font-semibold text-gray-500">Digital Savings Account</Text>
        <View className="mb-2 flex-row items-center">
          <Text className="mr-2 text-3xl font-bold">RM {showBalance ? '100.00' : '*****'}</Text>
          <TouchableOpacity onPress={() => setShowBalance((v) => !v)}>
            <Ionicons
              name={showBalance ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        <View className="flex items-center">
          <Text className="mb-1 text-sm tracking-widest text-gray-400">1002 0033 4444</Text>
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
              className="bg-primary mb-1 inline-flex w-full flex-row items-center justify-center rounded-2xl p-3"
              onPress={() => router.push('/account/transfer')}>
              <Text className="mr-2 font-bold text-white">Transfer</Text>
              <MaterialIcons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Container>
  );
}
