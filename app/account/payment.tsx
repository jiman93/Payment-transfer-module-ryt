import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Loader from '../../components/Loader';
import { useAccount, useTransferForm, useAuth } from '../../store/exports';
import { useStore } from '../../store';
import Authentication from '../../components/Authentication';

// Form type definition
type PaymentFormValues = {
  amount: string;
  reference: string;
  note: string;
};

export default function Payment() {
  const router = useRouter();
  const { account } = useAccount();
  const { currentTransfer, updateTransferDetails } = useTransferForm();
  const { fetchBankRecipient, fetchMobileRecipient } = useStore();
  const { requireAuthentication, handleAuthSuccess, handleAuthCancel, showAuthentication } =
    useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [proceedToReview, setProceedToReview] = useState(false);

  // Redirect if no currentTransfer is set
  useEffect(() => {
    if (!currentTransfer) {
      // Just wait for a moment before redirecting to allow AsyncStorage to load
      const timer = setTimeout(() => {
        if (!currentTransfer) {
          router.replace('/account/bank-transfer');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentTransfer, router]);

  // Fetch recipient details when component mounts
  useEffect(() => {
    const fetchRecipientDetails = async () => {
      if (!currentTransfer) return;

      try {
        // Only look up if we don't already have a recipient name
        if (!currentTransfer.recipientName) {
          // If accountNo exists, fetch bank recipient
          if (currentTransfer.accountNo) {
            const recipient = await fetchBankRecipient(currentTransfer.accountNo);
            if (recipient) {
              updateTransferDetails({
                recipientName: recipient.name,
              });
            }
          }
          // If mobileNumber exists, fetch mobile recipient
          else if (currentTransfer.mobileNumber) {
            const recipient = await fetchMobileRecipient(currentTransfer.mobileNumber);
            if (recipient) {
              updateTransferDetails({
                recipientName: recipient.name,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching recipient details:', error);
      }
    };

    fetchRecipientDetails();
  }, [currentTransfer, fetchBankRecipient, fetchMobileRecipient, updateTransferDetails]);

  // Focus states
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isReferenceFocused, setIsReferenceFocused] = useState(false);
  const [isDetailsFocused, setIsDetailsFocused] = useState(false);

  // Get transfer data from store
  const { recipientBank, accountNo, transactionType, recipientName, mobileNumber } =
    currentTransfer || {};

  // Determine transfer type from transfer data
  const isMobileTransfer = !!mobileNumber;

  // First set loading to true, then check after a delay to allow AsyncStorage to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Longer delay to ensure AsyncStorage has time to load

    return () => clearTimeout(timer);
  }, []);

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

    // Update transfer data in the store
    updateTransferDetails({
      amount: data.amount,
      reference: data.reference || '',
      note: data.note || '',
    });

    // Set flag to proceed and trigger authentication
    setProceedToReview(true);
    requireAuthentication();
  };

  // Handle successful authentication
  const handleAuthenticationSuccess = () => {
    handleAuthSuccess();
    setIsLoading(true);

    // Navigate to review page
    router.push('/account/review');
  };

  // Handle authentication cancellation
  const handleAuthenticationCancel = () => {
    handleAuthCancel();
    setProceedToReview(false);
    setIsLoading(false);
  };

  // Quick reference handler
  const handleQuickReference = (option: string) => {
    setValue('reference', option, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  if (isLoading) {
    return <Loader text="Loading payment details..." />;
  }

  if (!account || !currentTransfer) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="mb-4 text-center text-red-500">Transfer information not available</Text>
        <TouchableOpacity
          className="rounded-xl bg-blue-500 px-6 py-3"
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
                  <Text className="font-medium">{accountNo}</Text>
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
        {account && (
          <View className="mb-4 rounded-lg bg-gray-100 p-3">
            <Text className="text-sm text-gray-600">Available Balance</Text>
            <Text className="text-lg font-bold">
              {account.currency} {(account.balanceCents / 100).toFixed(2)}
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
                if (account && numValue * 100 > account.balanceCents) {
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
                      ? 'border-b-2 border-blue-500'
                      : errors.amount
                        ? 'border-b-2 border-red-500'
                        : 'border-gray-300'
                  }`}>
                  <Text className="mr-2 text-lg font-medium">{account?.currency || 'RM'}</Text>
                  <TextInput
                    className="flex-1 text-right text-2xl font-semibold"
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={(text) => {
                      // Remove all non-numeric characters
                      const numericValue = text.replace(/[^0-9]/g, '');

                      // Prevent empty input from breaking the format
                      if (!numericValue) {
                        onChange('');
                        return;
                      }

                      // Convert to number with 2 decimal places format
                      const amount = (parseInt(numericValue) / 100).toFixed(2);
                      onChange(amount);
                    }}
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
                      ? 'border-b-2 border-blue-500'
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
                  isDetailsFocused ? 'border-2 border-blue-500 bg-gray-50' : 'bg-gray-100'
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

        <TouchableOpacity
          className={`rounded-2xl py-4 ${
            watchedAmount && watchedReference ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          disabled={!watchedAmount || !watchedReference || isLoading}
          onPress={handleSubmit(onSubmit)}>
          <Text className="text-center font-bold text-white">
            {isLoading ? 'Loading...' : 'Continue to review'}
          </Text>
        </TouchableOpacity>

        {proceedToReview && (
          <Authentication
            onSuccess={handleAuthenticationSuccess}
            onCancel={handleAuthenticationCancel}
            promptMessage="Please authenticate to proceed with your payment"
            fallbackEnabled={true}
          />
        )}
      </ScrollView>
    </View>
  );
}
