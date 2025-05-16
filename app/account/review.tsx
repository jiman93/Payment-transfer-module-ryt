import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import Loader from '../../components/Loader';
import { useTransferForm } from '../../store/exports';
import ErrorScreen from '../../components/ErrorScreen';

export default function Review() {
  const router = useRouter();
  const { currentTransfer, confirmTransfer, isSubmitting } = useTransferForm();

  // Redirect if no currentTransfer is set after AsyncStorage loads
  useEffect(() => {
    if (!currentTransfer) {
      // Allow some time for AsyncStorage to load
      const timer = setTimeout(() => {
        if (!currentTransfer) {
          router.replace('/account/bank-transfer');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTransfer, router]);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Transfer failed. Please try again later.');

  // Show loader while loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Allow time for AsyncStorage to load

    return () => clearTimeout(timer);
  }, []);

  // Get transfer data from store
  const {
    recipientBank,
    accountNo,
    transactionType,
    amount,
    reference,
    note,
    recipientName,
    mobileNumber,
  } = currentTransfer || {};

  // Determine transfer type
  const isMobileTransfer = !!mobileNumber;

  const handleConfirm = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      // Confirm the transfer using store data
      // The confirmTransfer function has been updated to properly handle API errors
      const success = await confirmTransfer();

      if (success) {
        router.replace('/account/success');
      } else {
        // If confirmTransfer returns false, it means the API request failed
        setErrorMessage(
          'Transfer failed. The bank declined your transfer. Please try again later.'
        );
        setHasError(true);
      }
    } catch (err) {
      console.error('Transfer confirmation error:', err);
      setErrorMessage('An error occurred during transfer confirmation.');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 'RM 0.00';
    return `RM ${numAmount.toFixed(2)}`;
  };

  if (isLoading) {
    return <Loader text="Loading transfer details..." />;
  }

  if (hasError) {
    return (
      <ErrorScreen
        message={errorMessage}
        onRetry={() => router.replace('/account')}
        buttonText="Back to Home"
      />
    );
  }

  if (!currentTransfer) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="mb-4 text-center text-red-500">Transfer information not available</Text>
        <TouchableOpacity
          className="rounded-xl bg-primary px-6 py-3"
          onPress={() => router.replace('/account/bank-transfer')}>
          <Text className="font-medium text-white">Go Back to Transfers</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
                      {accountNo} • {recipientBank}
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
          disabled={isLoading || isSubmitting}>
          <Text className="text-center text-base font-semibold text-white">Confirm</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Spinner Overlay */}
      {(isLoading || isSubmitting) && <Loader text="Processing transfer..." />}
    </View>
  );
}
