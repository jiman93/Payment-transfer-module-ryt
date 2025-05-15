import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Spinner from '../../components/Spinner';

// Form type definition
type PaymentFormValues = {
  amount: string;
  reference: string;
  note: string;
};

export default function Payment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { recipientBank, accountNumber, transactionType } = params;
  const [isLoading, setIsLoading] = useState(true);

  // Focus states
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isReferenceFocused, setIsReferenceFocused] = useState(false);
  const [isDetailsFocused, setIsDetailsFocused] = useState(false);

  // Set loading to false after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Short delay to ensure smooth transition

    return () => clearTimeout(timer);
  }, []);

  // Quick reference options
  const referenceOptions = ['Fund Transfer', 'Gift', 'Meals'];

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
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

    console.log('Form submitted:', data);
    // Navigate to the next page or process payment
    // router.push(...);
  };

  // Quick reference handler
  const handleQuickReference = (option: string) => {
    setValue('reference', option, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

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
              <Text className="text-lg font-bold">JOHN DOE</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="font-medium">{accountNumber}</Text>
              <Text className="font-medium">•</Text>
              <Text className="font-medium">{recipientBank}</Text>
            </View>
            <Text className="font-light">{transactionType}</Text>
          </View>
          <Image
            source={require('../../assets/duitnow-logo.png')}
            style={{ width: 40, height: 40, resizeMode: 'contain' }}
          />
        </View>

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
                return (!isNaN(numValue) && numValue >= 10) || 'Minimum amount is RM 10.00';
              },
            }}
            render={({ field: { onChange, value, onBlur } }) => (
              <>
                <View
                  className={`flex-row items-center border-b pb-2 ${
                    isAmountFocused
                      ? 'border-primary border-b-2'
                      : errors.amount
                        ? 'border-b-2 border-red-500'
                        : 'border-gray-300'
                  }`}>
                  <Text className="mr-2 text-lg font-medium">RM</Text>
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
                      ? 'border-primary border-b-2'
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
                  isDetailsFocused ? 'border-primary border-2 bg-gray-50' : 'bg-gray-100'
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

      {/* Next Button */}
      <View className="absolute bottom-8 left-0 right-0 px-4">
        <TouchableOpacity
          className={`w-full rounded-full py-4 ${watchedAmount ? 'bg-primary' : 'bg-primary/30'}`}
          disabled={!watchedAmount}
          onPress={handleSubmit(onSubmit)}>
          <Text className="text-center text-base font-semibold text-white">Next</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Spinner Overlay */}
      {isLoading && <Spinner text="Loading payment details..." />}
    </View>
  );
}
