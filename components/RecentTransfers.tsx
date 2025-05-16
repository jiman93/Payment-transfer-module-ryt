import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { RecentTransfer } from '~/mocks/transfers';

type RecentTransfersProps = {
  recentTransfers: RecentTransfer[];
};

const RecentTransfers = ({ recentTransfers }: RecentTransfersProps) => {
  // Helper function to format currency
  const formatAmount = (amountCents: number) => {
    const amount = amountCents / 100;
    return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Render a recent transfer item
  const renderRecentTransferItem = ({ item }: { item: RecentTransfer }) => {
    const formattedDate = new Date(item.date).toLocaleDateString();

    return (
      <TouchableOpacity
        className="mb-4 rounded-xl border border-gray-200 p-4"
        onPress={() => {
          // Navigate to transfer details or initiate a new transfer to this recipient
          Alert.alert('Transfer Details', `Transfer ID: ${item.id}`);
        }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold">{item.recipientName}</Text>
            {item.recipientType === 'BANK' ? (
              <Text className="text-sm text-gray-600">
                {item.recipientIdentifier} • {item.bankName}
              </Text>
            ) : (
              <Text className="text-sm text-gray-600">{item.recipientIdentifier}</Text>
            )}
            <Text className="mt-1 text-xs text-gray-500">{formattedDate}</Text>
          </View>
          <View>
            <Text className="text-base font-bold text-primary">
              {formatAmount(item.amountCents)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1">
      {recentTransfers.length > 0 ? (
        <FlatList
          data={recentTransfers}
          renderItem={renderRecentTransferItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-center text-gray-500">No recent transfers</Text>
        </View>
      )}
    </View>
  );
};

export default RecentTransfers;
