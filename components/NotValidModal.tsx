import { View, Text, TouchableOpacity, Modal } from 'react-native';
import React from 'react';

interface NotValidModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

const NotValidModal = ({
  visible,
  onClose,
  title = 'Not valid',
  message = 'Account number entered is invalid or transfer type is incorrect. Please check with your recipient or re-enter the account number.',
  buttonText = 'OK',
}: NotValidModalProps) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        className="flex-1 items-center justify-center px-4"
        onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl bg-white p-6">
          <Text className="mb-3 text-2xl font-bold text-gray-800">{title}</Text>
          <Text className="mb-6 text-gray-600">{message}</Text>
          <TouchableOpacity className="bg-primary w-full rounded-full py-4" onPress={onClose}>
            <Text className="text-center text-base font-semibold text-white">{buttonText}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default NotValidModal;
