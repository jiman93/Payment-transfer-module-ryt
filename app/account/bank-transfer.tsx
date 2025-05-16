import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { MALAYSIAN_BANKS, TRANSACTION_TYPES } from '~/mocks';
import { Channel } from '~/types/models';
import Loader from '~/components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';

type BankTransferFormValues = {
  recipientBank: string;
  accountNumber: string;
  transactionType: string;
};

export default function BankTransfer() {
  const router = useRouter();
  const [isAccountNumberFocused, setIsAccountNumberFocused] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form for bank transfers
  const { control, handleSubmit, watch, setValue } = useForm<BankTransferFormValues>({
    defaultValues: {
      recipientBank: '',
      accountNumber: '',
      transactionType: '',
    },
  });

  const watchedValues = watch();

  // Form validation
  const isFormValid =
    watchedValues.recipientBank !== '' &&
    watchedValues.accountNumber !== '' &&
    watchedValues.transactionType !== '';

  // Handle bank transfer form submission
  const onSubmitBankTransfer = (data: BankTransferFormValues) => {
    // Validate account number has at least 4 digits
    if (data.accountNumber.length < 4) {
      Alert.alert('Invalid Account Number', 'Account number must be at least 4 digits');
      return;
    }

    setLoading(true);

    // Small delay to simulate processing
    setTimeout(() => {
      setLoading(false);

      // Navigate to payment page with transfer details
      router.push({
        pathname: '/account/payment',
        params: {
          recipientBank: data.recipientBank,
          accountNumber: data.accountNumber,
          transactionType: data.transactionType,
          channel: Channel.BANK_ACCOUNT,
        },
      });
    }, 500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}

      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-semibold text-gray-800">
          Bank Transfer
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Bank Transfer Form */}
      <ScrollView className="flex-1 px-4">
        {/* Recipient Bank */}
        <View className="mb-8 mt-4">
          <Text className="text-sm font-medium text-gray-500">Recipient Bank</Text>
          <Controller
            control={control}
            name="recipientBank"
            rules={{ validate: (value) => value !== '' }}
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                className="flex-row items-center justify-between border-b border-gray-300 py-3"
                onPress={() => {
                  setShowBankModal(true);
                }}>
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
              required: true,
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
                onPress={() => {
                  setShowTypeModal(true);
                }}>
                <Text className={`text-base ${value === '' ? 'text-gray-400' : 'text-gray-700'}`}>
                  {value || 'Select type'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#aaa" />
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>

      {/* Next Button */}
      <View className="px-4 py-8">
        <TouchableOpacity
          className={`w-full rounded-full py-4 ${isFormValid ? 'bg-primary' : 'bg-primary/30'}`}
          onPress={handleSubmit(onSubmitBankTransfer)}
          disabled={!isFormValid}>
          <Text className="text-center text-base font-semibold text-white">Next</Text>
        </TouchableOpacity>
      </View>

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
                  className={`rounded-xl border p-4 ${
                    watchedValues.recipientBank === bank
                      ? 'border-2 border-primary'
                      : 'border-gray-200'
                  }`}
                  onPress={() => {
                    setValue('recipientBank', bank);
                    setShowBankModal(false);
                  }}>
                  <Text
                    className={`text-base ${
                      watchedValues.recipientBank === bank ? 'font-semibold text-primary' : ''
                    }`}>
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
                    className={`w-full rounded-xl border p-4 ${
                      watchedValues.transactionType === type
                        ? 'border-2 border-primary'
                        : 'border-gray-200'
                    }`}
                    onPress={() => {
                      setValue('transactionType', type);
                      setShowTypeModal(false);
                    }}>
                    <Text
                      className={`text-center text-base ${
                        watchedValues.transactionType === type ? 'font-semibold text-primary' : ''
                      }`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Loading indicator */}
      {loading && <Loader text="Processing..." />}
    </SafeAreaView>
  );
}
