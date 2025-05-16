import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import Loader from '~/components/Loader';
import { useTransfer } from '~/contexts';
import { TransferStatus } from '~/types/models';

export default function Processing() {
  const router = useRouter();
  const { transfer, pollTransferStatus, loading } = useTransfer();
  const [pollingCount, setPollingCount] = useState(0);
  const [status, setStatus] = useState<TransferStatus | null>(null);

  // Poll for status updates
  useEffect(() => {
    if (!transfer.currentTransfer) {
      return;
    }

    let timeout: NodeJS.Timeout;
    const maxPolls = 10; // Maximum number of polls to prevent infinite loops
    const pollInterval = 2000; // Poll every 2 seconds

    const pollStatus = async () => {
      if (pollingCount >= maxPolls) {
        return; // Stop polling after max attempts
      }

      try {
        const newStatus = await pollTransferStatus();
        setStatus(newStatus);

        if (newStatus === TransferStatus.SUCCESS) {
          // Navigate to success page
          router.replace({
            pathname: '/account/success',
          });
        } else if (newStatus === TransferStatus.FAILED) {
          // Navigate back to transfer page with error
          router.replace({
            pathname: '/account/transfer',
            params: { error: 'Transfer failed. Please try again.' },
          });
        } else {
          // Continue polling if still processing
          timeout = setTimeout(() => {
            setPollingCount((prev) => prev + 1);
            pollStatus();
          }, pollInterval);
        }
      } catch (error) {
        console.error('Error polling transfer status:', error);
      }
    };

    // Start polling
    pollStatus();

    // Cleanup
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [transfer.currentTransfer, pollingCount]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      <Loader text="Processing your transfer..." />

      <Text className="mt-8 text-center text-lg text-gray-700">
        Your transfer is being processed. This might take a moment.
      </Text>

      <Text className="mt-4 text-center text-gray-500">
        Please don't close this page. You'll be automatically redirected when the transfer is
        complete.
      </Text>

      <TouchableOpacity
        className="mt-12 rounded-xl bg-gray-200 px-8 py-3"
        onPress={() => router.replace('/account')}>
        <Text className="font-medium text-gray-800">Back to Account</Text>
      </TouchableOpacity>
    </View>
  );
}
