import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { TRANSACTION_TYPES, MALAYSIAN_BANKS } from '../../mocks/bankData';
import { TransactionType } from '../../types/models';
import Loader from '../../components/Loader';
import { useTransferForm } from '../../store/exports';

type BankTransferFormValues = {
  recipientBank: string;
  accountNo: string;
  transactionType: TransactionType;
};

export default function BankTransfer() {
  const router = useRouter();
  const { startTransfer } = useTransferForm();

  const [isAccountNumberFocused, setIsAccountNumberFocused] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form for bank transfers
  const { control, handleSubmit, watch, setValue } = useForm<BankTransferFormValues>({
    defaultValues: {
      recipientBank: '',
      accountNo: '',
      transactionType: 'Fund Transfer' as TransactionType,
    },
  });

  const watchedValues = watch();

  // Form validation
  const isFormValid =
    watchedValues.recipientBank !== '' &&
    watchedValues.accountNo !== '' &&
    !!watchedValues.transactionType;

  // Handle bank transfer form submission
  const onSubmitBankTransfer = async (data: BankTransferFormValues) => {
    // Validate account number has at least 4 digits
    if (data.accountNo.length < 4) {
      Alert.alert('Invalid Input', 'Account number must be at least 4 digits');
      return;
    }

    setLoading(true);

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use the Zustand store
      startTransfer({
        recipientBank: data.recipientBank,
        accountNo: data.accountNo,
        transactionType: data.transactionType,
      });

      // Navigate to payment page
      router.push('/account/payment');
    } catch (error) {
      console.error('Transfer error:', error);
      Alert.alert('Error', 'Could not process transfer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white pt-10">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 pt-12">
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
            name="accountNo"
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`border-b py-3 text-base text-gray-700 ${
                  isAccountNumberFocused ? 'border-b-2 border-blue-500' : 'border-gray-300'
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
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                className="flex-row items-center justify-between border-b border-gray-300 py-3"
                onPress={() => {
                  setShowTypeModal(true);
                }}>
                <Text className={`text-base ${!value ? 'text-gray-400' : 'text-gray-700'}`}>
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
          className={`w-full rounded-full py-4 ${isFormValid ? 'bg-blue-500' : 'bg-blue-300'}`}
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
                      ? 'border-2 border-blue-500'
                      : 'border-gray-200'
                  }`}
                  onPress={() => {
                    setValue('recipientBank', bank);
                    setShowBankModal(false);
                  }}>
                  <Text
                    className={`text-base ${
                      watchedValues.recipientBank === bank ? 'font-semibold text-blue-500' : ''
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
                        ? 'border-2 border-blue-500'
                        : 'border-gray-200'
                    }`}
                    onPress={() => {
                      setValue('transactionType', type as TransactionType);
                      setShowTypeModal(false);
                    }}>
                    <Text
                      className={`text-center text-base ${
                        watchedValues.transactionType === type ? 'font-semibold text-blue-500' : ''
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
    </View>
  );
}
