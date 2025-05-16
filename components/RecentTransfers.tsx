import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Transfer } from '../types/models';
import { useTransfers } from '../store/exports';
import { useEffect, useState } from 'react';
import Loader from './Loader';
import { Ionicons } from '@expo/vector-icons';
import ErrorScreen from './ErrorScreen';

const RecentTransfers = () => {
  // Get transfers data and loading state from our store
  const {
    transfers,
    pagination,
    fetchTransfers,
    isLoading,
    fetchMoreTransfers,
    isLoadingMore,
    error,
  } = useTransfers();

  const [hasError, setHasError] = useState(false);

  // Load transfers on component mount
  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    try {
      setHasError(false);
      await fetchTransfers();
    } catch (error) {
      setHasError(true);
    }
  };

  // Helper function to format currency
  const formatAmount = (amountCents: number) => {
    const amount = amountCents / 100;
    return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Render a transfer item
  const renderTransferItem = ({ item }: { item: Transfer }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString();

    return (
      <TouchableOpacity
        className="mb-4 rounded-xl border border-gray-200 p-4"
        onPress={() => {
          // Navigate to transfer details or initiate a new transfer to this recipient
          Alert.alert('Transfer Details', `Transfer ID: ${item.id}`);
        }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold">{item.recipient.name}</Text>
            {item.recipient.type === 'BANK' ? (
              <Text className="text-sm text-gray-600">
                {item.recipient.accountNo} • {item.recipient.bankCode}
              </Text>
            ) : (
              <Text className="text-sm text-gray-600">{item.recipient.mobileNumber}</Text>
            )}
            <Text className="mt-1 text-xs text-gray-500">{formattedDate}</Text>
          </View>
          <View>
            <Text className="text-base font-bold text-blue-500">
              {formatAmount(item.amountCents)}
            </Text>
            <Text className="text-right text-xs text-gray-500">{item.transactionType}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render footer with load more button
  const renderFooter = () => {
    if (isLoadingMore) {
      return <Loader text="Loading more..." />;
    }

    if (!pagination.hasMore) {
      return (
        <View className="items-center py-4">
          <Text className="text-gray-500">No more transfers to load</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        className="flex-row items-center justify-center py-4"
        onPress={fetchMoreTransfers}
        disabled={isLoading || isLoadingMore}>
        <Text className="mr-2 font-medium text-blue-500">Load more</Text>
        <Ionicons name="chevron-down" size={16} color="#3b82f6" />
      </TouchableOpacity>
    );
  };

  // If there's an error, show the error screen
  if (hasError) {
    return (
      <ErrorScreen message="Failed to load transfers. Please try again." onRetry={loadTransfers} />
    );
  }

  // Handle loading state
  if (isLoading && transfers.length === 0) {
    return <Loader text="Loading transfers..." />;
  }

  // Render the list or empty state
  return (
    <View className="flex-1">
      <Text className="mb-4 text-xl font-bold text-gray-800">Recent Transfers</Text>

      {transfers.length > 0 ? (
        <FlatList
          data={transfers}
          renderItem={renderTransferItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          onEndReached={() => {
            // Removed auto-loading on end reached
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <View className="items-center justify-center py-8">
          <Text className="text-center text-gray-500">No recent transfers</Text>
        </View>
      )}
    </View>
  );
};

export default RecentTransfers;
