import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Loader from '../../components/Loader';
import { useTransfer, useAccounts } from '~/contexts';
import { Channel } from '~/types/models';

// Form type definition
type PaymentFormValues = {
  amount: string;
  reference: string;
  note: string;
};

export default function Payment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    transferId,
    recipientBank,
    accountNumber,
    transactionType,
    recipientName,
    mobileNumber,
    channel,
  } = params;

  const { transfer, loading: transferLoading, error: transferError } = useTransfer();
  const { selectedAccount } = useAccounts();

  const [isLoading, setIsLoading] = useState(true);

  // Focus states
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isReferenceFocused, setIsReferenceFocused] = useState(false);
  const [isDetailsFocused, setIsDetailsFocused] = useState(false);

  // Determine transfer type from params
  const isMobileTransfer = channel === Channel.MOBILE_NUMBER || mobileNumber;

  // Set loading to false after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Short delay to ensure smooth transition

    return () => clearTimeout(timer);
  }, []);

  // Check if we have a valid transfer
  useEffect(() => {
    if (transferId && !transfer.currentTransfer && !transferLoading) {
      Alert.alert('Transfer Error', 'Unable to find the transfer details. Please try again.', [
        { text: 'Go Back', onPress: () => router.back() },
      ]);
    }
  }, [transferId, transfer.currentTransfer, transferLoading]);

  // Quick reference options
  const referenceOptions = ['Fund Transfer', 'Gift', 'Meals', 'Others'];

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    defaultValues: {
      amount: '',
      reference: '',
      note: '',
    },
    mode: 'onTouched', // Validate on blur and submit
  });

  // Watch amount and reference values to determine if Next button should be enabled
  const watchedAmount = watch('amount');
  const watchedReference = watch('reference');

  // Form submission handler
  const onSubmit = (data: PaymentFormValues) => {
    // Validate minimum amount
    const amountValue = parseFloat(data.amount);
    if (isNaN(amountValue) || amountValue < 10) {
      setValue('amount', data.amount, { shouldValidate: true });
      return;
    }

    // Set loading before navigation
    setIsLoading(true);

    // Calculate amount in cents
    const amountCents = Math.round(amountValue * 100);

    // Navigate to review page with all the necessary data
    router.push({
      pathname: '/account/review',
      params: {
        ...params, // Pass through the existing params from transfer page
        amount: data.amount,
        amountCents: amountCents.toString(),
        reference: data.reference || '',
        note: data.note || '',
      },
    } as any);
  };

  // Quick reference handler
  const handleQuickReference = (option: string) => {
    setValue('reference', option, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  if (transferLoading || isLoading) {
    return <Loader text="Loading payment details..." />;
  }

  if (transferError) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="mb-4 text-center text-red-500">{transferError}</Text>
        <TouchableOpacity className="rounded-xl bg-primary px-6 py-3" onPress={() => router.back()}>
          <Text className="font-medium text-white">Go Back</Text>
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
      </View>

      <ScrollView className="px-4">
        {/* Transfer Details */}
        <View className="mb-8 mt-4 flex-row items-center justify-between rounded-xl bg-gray-50 p-4">
          <View className="flex-col justify-center gap-1">
            <View>
              <Text className="text-xs text-gray-500">Recipient</Text>
              <Text className="text-lg font-bold">{recipientName || 'JOHN DOE'}</Text>
            </View>
            {isMobileTransfer ? (
              // Mobile transfer details
              <View>
                <Text className="font-medium">{mobileNumber}</Text>
                <Text className="font-light">Mobile Transfer</Text>
              </View>
            ) : (
              // Bank transfer details
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="font-medium">{accountNumber}</Text>
                  <Text className="font-medium">•</Text>
                  <Text className="font-medium">{recipientBank}</Text>
                </View>
                <Text className="font-light">{transactionType}</Text>
              </View>
            )}
          </View>
          <Image
            source={require('../../assets/duitnow-logo.png')}
            style={{ width: 40, height: 40, resizeMode: 'contain' }}
          />
        </View>

        {/* Account Balance */}
        {selectedAccount && (
          <View className="mb-4 rounded-lg bg-gray-100 p-3">
            <Text className="text-sm text-gray-600">Available Balance</Text>
            <Text className="text-lg font-bold">
              {selectedAccount.currency} {(selectedAccount.balanceCents / 100).toFixed(2)}
            </Text>
          </View>
        )}

        {/* Amount Section */}
        <View className="mb-8">
          <Text className="mb-2 text-lg font-semibold">Amount</Text>
          <Controller
            control={control}
            name="amount"
            rules={{
              required: 'Amount is required',
              validate: (value) => {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 10) {
                  return 'Minimum amount is RM 10.00';
                }

                // Check if amount exceeds available balance
                if (selectedAccount && numValue * 100 > selectedAccount.balanceCents) {
                  return 'Amount exceeds available balance';
                }

                return true;
              },
            }}
            render={({ field: { onChange, value, onBlur } }) => (
              <>
                <View
                  className={`flex-row items-center border-b pb-2 ${
                    isAmountFocused
                      ? 'border-b-2 border-primary'
                      : errors.amount
                        ? 'border-b-2 border-red-500'
                        : 'border-gray-300'
                  }`}>
                  <Text className="mr-2 text-lg font-medium">
                    {selectedAccount?.currency || 'RM'}
                  </Text>
                  <TextInput
                    className="flex-1 text-right text-2xl font-semibold"
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setIsAmountFocused(true)}
                    onBlur={() => {
                      setIsAmountFocused(false);
                      onBlur();
                    }}
                    selectionColor="#5271FF"
                  />
                </View>
                {errors.amount && (
                  <Text className="mt-1 text-sm text-red-500">{errors.amount.message}</Text>
                )}
              </>
            )}
          />
        </View>

        {/* Recipient reference Section */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-semibold">Recipient Reference</Text>
          <Controller
            control={control}
            name="reference"
            rules={{
              required: 'Recipient reference is required',
            }}
            render={({ field: { onChange, value, onBlur } }) => (
              <>
                <TextInput
                  className={`border-b py-2 text-base ${
                    isReferenceFocused
                      ? 'border-b-2 border-primary'
                      : errors.reference
                        ? 'border-b-2 border-red-500'
                        : 'border-gray-300'
                  }`}
                  placeholder="Enter reference"
                  placeholderTextColor="#9CA3AF"
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setIsReferenceFocused(true)}
                  onBlur={() => {
                    setIsReferenceFocused(false);
                    onBlur();
                  }}
                  selectionColor="#5271FF"
                />
                {errors.reference && (
                  <Text className="mt-1 text-sm text-red-500">{errors.reference.message}</Text>
                )}
              </>
            )}
          />
        </View>

        {/* Quick reference options */}
        <View className="mb-8 flex-row gap-2">
          {referenceOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              className="rounded-full bg-gray-200 px-5 py-2"
              onPress={() => handleQuickReference(option)}>
              <Text className="text-gray-700">{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment details */}
        <View className="mb-20">
          <Text className="mb-2 text-lg font-semibold">Payment Details (Optional)</Text>
          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                className={`h-20 rounded-xl p-4 text-gray-700 ${
                  isDetailsFocused ? 'border-2 border-primary bg-gray-50' : 'bg-gray-100'
                }`}
                multiline
                numberOfLines={4}
                placeholder="Add details about this transfer..."
                placeholderTextColor="#9CA3AF"
                value={value}
                onChangeText={onChange}
                onFocus={() => setIsDetailsFocused(true)}
                onBlur={() => {
                  setIsDetailsFocused(false);
                  onBlur();
                }}
                selectionColor="#5271FF"
              />
            )}
          />
        </View>
      </ScrollView>

      {/* Bottom action area */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
        <TouchableOpacity
          className={`rounded-2xl py-4 ${
            watchedAmount && watchedReference ? 'bg-primary' : 'bg-gray-300'
          }`}
          disabled={!watchedAmount || !watchedReference}
          onPress={handleSubmit(onSubmit)}>
          <Text className="text-center font-bold text-white">Next</Text>
        </TouchableOpacity>
      </View>

      {/* Loading overlay */}
      {isLoading && <Loader text="Preparing your transfer..." />}
    </View>
  );
}
