import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import Loader from '../../components/Loader';
import { useTransfer } from '~/contexts';
import { TransferStatus, Channel } from '~/types/models';

export default function Review() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    transferId,
    recipientBank,
    accountNumber,
    transactionType,
    amount,
    reference,
    note,
    recipientName,
    mobileNumber,
    channel,
  } = params;

  const { transfer, confirmCurrentTransfer, loading, error, pollTransferStatus } = useTransfer();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);

  // Determine transfer type
  const isMobileTransfer = channel === Channel.MOBILE_NUMBER || mobileNumber;

  // Check if we have a valid transfer
  useEffect(() => {
    if (!transfer.currentTransfer && !loading) {
      Alert.alert('Transfer Error', 'Unable to find the transfer details. Please try again.', [
        { text: 'Go Back', onPress: () => router.replace('/account') },
      ]);
    }
  }, [transfer.currentTransfer, loading]);

  const handleConfirm = async () => {
    setIsLoading(true);
    setConfirmationError(null);

    try {
      // Confirm the transfer directly without authentication
      const confirmedTransfer = await confirmCurrentTransfer();

      if (confirmedTransfer) {
        // Poll for transfer status
        let status = confirmedTransfer.status;

        // If transfer is processing, poll a few times to check status
        if (status === TransferStatus.PROCESSING) {
          let attempts = 0;
          const maxAttempts = 3;

          while (status === TransferStatus.PROCESSING && attempts < maxAttempts) {
            // Wait a second between polls
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Poll for latest status
            const newStatus = await pollTransferStatus();
            if (newStatus) {
              status = newStatus;
            }

            attempts++;
          }
        }

        // Navigate to appropriate page based on status
        if (status === TransferStatus.SUCCESS) {
          router.replace('/account/success');
        } else if (status === TransferStatus.FAILED) {
          // Handle failed transfer
          setConfirmationError('Transfer failed. Please try again later.');
        } else {
          // Transfer is still processing
          router.replace('/account/processing');
        }
      } else {
        setConfirmationError('Failed to confirm transfer. Please try again.');
      }
    } catch (err) {
      console.error('Transfer confirmation error:', err);
      setConfirmationError('An error occurred during transfer confirmation.');
    } finally {
      setIsLoading(false);
    }
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

        {/* Error message if confirmation failed */}
        {confirmationError && (
          <View className="mb-4 rounded-lg bg-red-100 p-3">
            <Text className="text-center text-red-600">{confirmationError}</Text>
          </View>
        )}

        {/* Card Section */}
        <View className="my-4 rounded-2xl bg-gray-50 p-5">
          <Text className="mb-4 text-lg font-semibold">Transfer Details</Text>

          {/* Recipient Details */}
          <View className="mb-4 border-b border-gray-200 pb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-500">Recipient</Text>
                <Text className="text-base font-semibold">{recipientName || 'JOHN DOE'}</Text>
                {isMobileTransfer ? (
                  // Mobile transfer details
                  <View>
                    <Text className="text-sm text-gray-700">{mobileNumber}</Text>
                    <Text className="text-sm text-gray-500">Mobile Transfer</Text>
                  </View>
                ) : (
                  // Bank transfer details
                  <View>
                    <Text className="text-sm text-gray-700">
                      {accountNumber} • {recipientBank}
                    </Text>
                    <Text className="text-sm text-gray-500">{transactionType}</Text>
                  </View>
                )}
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
      <View className="absolute bottom-8 left-0 right-0 px-4">
        <TouchableOpacity
          className="w-full rounded-full bg-primary py-4"
          onPress={handleConfirm}
          disabled={isLoading || loading}>
          <Text className="text-center text-base font-semibold text-white">Confirm</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Spinner Overlay */}
      {(isLoading || loading) && <Loader text="Processing transfer..." />}
    </View>
  );
}
