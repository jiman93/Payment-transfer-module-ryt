import { View, Text, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import NotValidModal from '../../components/NotValidModal';
import Authentication from '../../components/Authentication';
import Loader from '../../components/Loader';

// Array of Malaysian banks and digital banks
const MALAYSIAN_BANKS = [
  'Maybank',
  'CIMB Bank',
  'Public Bank',
  'RHB Bank',
  'Hong Leong Bank',
  'AmBank',
  'Bank Islam',
  "Touch 'n Go eWallet",
  'Boost',
  'GrabPay',
];

// Account types
const TRANSACTION_TYPES = ['Fund Transfer', 'Credit Card Payment', 'Loan Payment'];

// Other transfer options
const OTHER_TRANSFER_OPTIONS = [
  'Mobile',
  'NRIC',
  'Passport Number',
  'Police / Army ID',
  'Business Registration',
];

// Form type definition
type BankTransferFormValues = {
  recipientBank: string;
  accountNumber: string;
  transactionType: string;
};

export default function Transfer() {
  const router = useRouter();
  const [tab, setTab] = useState<'bank' | 'others'>('bank');
  const [isAccountNumberFocused, setIsAccountNumberFocused] = useState(false);
  const [showAuthentication, setShowAuthentication] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transferData, setTransferData] = useState<BankTransferFormValues | null>(null);

  // Bank modal
  const [showBankModal, setShowBankModal] = useState(false);

  // Transaction type modal
  const [showTypeModal, setShowTypeModal] = useState(false);

  // Error modal
  const [showErrorModal, setShowErrorModal] = useState(false);

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BankTransferFormValues>({
    defaultValues: {
      recipientBank: '',
      accountNumber: '',
      transactionType: '',
    },
    mode: 'onChange', // Validate on change for real-time button disabling
  });

  // Watch form values to check if all fields are filled
  const watchedValues = watch();
  const isFormValid =
    tab === 'bank' &&
    watchedValues.recipientBank !== '' &&
    watchedValues.accountNumber !== '' &&
    watchedValues.transactionType !== '';

  // Form submission handler
  const onSubmit = (data: BankTransferFormValues) => {
    if (tab === 'bank') {
      // Check if account number has less than 4 digits
      if (data.accountNumber.length < 4) {
        // Show error modal for short account numbers
        setShowErrorModal(true);
        return;
      }

      // Store the data and show authentication
      setTransferData(data);
      setShowAuthentication(true);
    } else {
      // For others tab, show error modal
      setShowErrorModal(true);
    }
  };

  const handleAuthenticated = () => {
    if (!transferData) return;

    // Show loading state
    setIsLoading(true);

    // Add delay for loading state visibility
    setTimeout(() => {
      // Navigate to payment page with the stored data
      router.push({
        pathname: '/account/payment',
        params: transferData,
      } as any);

      // Reset states
      setIsLoading(false);
      setShowAuthentication(false);
      setTransferData(null);
    }, 1000);
  };

  const handleAuthCancel = () => {
    setShowAuthentication(false);
    setTransferData(null);
  };

  return (
    <View className="mb-8 flex-1 bg-white pt-8">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-8 pt-12">
        <TouchableOpacity onPress={() => router.replace('/account')}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-semibold text-gray-800">Transfer</Text>
        <View style={{ width: 24 }} />
      </View>
      {/* Tabs */}
      <View className="mb-6 flex-row px-4">
        <TouchableOpacity
          className={`flex-1 items-center rounded-full py-2 ${tab === 'bank' ? 'bg-primary' : 'bg-gray-100'}`}
          onPress={() => setTab('bank')}>
          <Text className={`font-bold ${tab === 'bank' ? 'text-white' : 'text-gray-500'}`}>
            Bank Account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`ml-2 flex-1 items-center rounded-full py-2 ${tab === 'others' ? 'bg-primary' : 'bg-gray-100'}`}
          onPress={() => setTab('others')}>
          <Text className={`font-bold ${tab === 'others' ? 'text-white' : 'text-gray-500'}`}>
            Others
          </Text>
        </TouchableOpacity>
      </View>
      {/* Bank Account Form */}
      {tab === 'bank' && (
        <View className="mb-6 px-4">
          {/* Recipient Bank */}
          <View className="mb-8 mt-8">
            <Text className="text-sm font-medium text-gray-500">Recipient Bank</Text>
            <Controller
              control={control}
              name="recipientBank"
              rules={{ validate: (value) => value !== '' }}
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  className="flex-row items-center justify-between border-b border-gray-300 py-3"
                  onPress={() => setShowBankModal(true)}>
                  <Text className={`text-base ${value === '' ? 'text-gray-400' : 'text-gray-700'}`}>
                    {value || 'Select bank'}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#aaa" />
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Account Number */}
          <View className="mb-8">
            <Text className="text-sm font-medium text-gray-500">Account Number</Text>
            <Controller
              control={control}
              name="accountNumber"
              rules={{
                required: true, // Only require any input
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`border-b py-3 text-base text-gray-700 ${
                    isAccountNumberFocused ? 'border-b-2 border-primary' : 'border-gray-300'
                  }`}
                  placeholder="Account number"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  onBlur={() => {
                    onBlur();
                    setIsAccountNumberFocused(false);
                  }}
                  onFocus={() => setIsAccountNumberFocused(true)}
                />
              )}
            />
          </View>
          {/* Transfer Type */}
          <View className="mb-8">
            <Text className="text-sm font-medium text-gray-500">Transfer type</Text>
            <Controller
              control={control}
              name="transactionType"
              rules={{ validate: (value) => value !== '' }}
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  className="flex-row items-center justify-between border-b border-gray-300 py-3"
                  onPress={() => setShowTypeModal(true)}>
                  <Text className={`text-base ${value === '' ? 'text-gray-400' : 'text-gray-700'}`}>
                    {value || 'Select type'}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#aaa" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      )}
      {/* Others Tab */}
      {tab === 'others' && (
        <View className="mb-6 px-4">
          <Text className="mb-4 text-lg font-semibold">Select transfer method</Text>
          {OTHER_TRANSFER_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={index}
              className="mb-3 flex-row items-center justify-between rounded-xl bg-gray-100 p-4"
              onPress={() => {
                // No action for now
              }}>
              <Text className="text-base text-gray-700">{option}</Text>
              <Ionicons name="chevron-forward" size={20} color="#5271FF" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Transfer Button */}
      <View className="absolute bottom-8 left-0 right-0 px-4">
        <TouchableOpacity
          className={`w-full rounded-full py-4 ${isFormValid ? 'bg-primary' : 'bg-primary/30'}`}
          onPress={handleSubmit(onSubmit)}
          disabled={!isFormValid}>
          <Text className="text-center text-base font-semibold text-white">Next</Text>
        </TouchableOpacity>
      </View>

      {/* Authentication Modal */}
      {showAuthentication && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={showAuthentication}
          onRequestClose={handleAuthCancel}>
          <Authentication onAuthenticate={handleAuthenticated} onCancel={handleAuthCancel} />
        </Modal>
      )}

      {/* Loading Spinner */}
      {isLoading && <Loader text="Preparing transfer details..." />}

      {/* Bank Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showBankModal}
        onRequestClose={() => setShowBankModal(false)}>
        <View className="flex-1 bg-white pt-8">
          <View className="flex-row items-center px-4 pb-4 pt-12">
            <TouchableOpacity onPress={() => setShowBankModal(false)}>
              <Ionicons name="arrow-back" size={24} color="#222" />
            </TouchableOpacity>
          </View>
          <View className="px-4">
            <Text className="mb-4 text-center text-lg font-bold">Select Bank</Text>
            <View className="gap-2">
              {MALAYSIAN_BANKS.map((bank, index) => (
                <TouchableOpacity
                  key={index}
                  className={`rounded-xl border p-4 ${watchedValues.recipientBank === bank ? 'border-2 border-primary' : 'border-gray-200'}`}
                  onPress={() => {
                    setValue('recipientBank', bank);
                    setShowBankModal(false);
                  }}>
                  <Text
                    className={`text-base ${watchedValues.recipientBank === bank ? 'font-semibold text-primary' : ''}`}>
                    {bank}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Transaction Type Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTypeModal}
        onRequestClose={() => setShowTypeModal(false)}>
        <TouchableOpacity
          activeOpacity={1}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          className="flex-1 justify-end"
          onPress={() => setShowTypeModal(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="h-2/5 rounded-t-3xl bg-white shadow-lg">
            <View className="items-center p-4">
              <View className="mb-4 h-1.5 w-12 rounded-full bg-gray-300" />
              <Text className="mb-4 text-lg font-bold">Select Transaction Type</Text>
              <View className="w-full gap-2 px-4">
                {TRANSACTION_TYPES.map((type, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`w-full rounded-xl border p-4 ${watchedValues.transactionType === type ? 'border-2 border-primary' : 'border-gray-200'}`}
                    onPress={() => {
                      setValue('transactionType', type);
                      setShowTypeModal(false);
                    }}>
                    <Text
                      className={`text-center text-base ${watchedValues.transactionType === type ? 'font-semibold text-primary' : ''}`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Error Modal */}
      <NotValidModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Invalid Account Number"
        message="Account number must be at least 4 digits. Please check and re-enter the account number."
      />
    </View>
  );
}
