import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import Loader from '../../components/Loader';
import { TransactionType } from '../../types/models';
import { useTransferForm } from '../../store/exports';

type ContactWithState = Contacts.Contact & {
  phoneNumber?: string;
};

export default function MobileTransfer() {
  const router = useRouter();
  const { startTransfer } = useTransferForm();

  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<ContactWithState[]>([]);
  const [showContactsList, setShowContactsList] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSyncLoading, setContactSyncLoading] = useState(false);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = contact.name?.toLowerCase().includes(searchLower);
    const phoneMatch = contact.phoneNumber?.toLowerCase().includes(searchLower);
    return nameMatch || phoneMatch;
  });

  const handleSyncContacts = () => {
    // Show contact access permission modal
    setShowContactModal(true);
  };

  const getFullContacts = async () => {
    setContactSyncLoading(true);

    try {
      // Request permission to access contacts
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === 'granted') {
        // Get all contacts if permission is granted
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
          sort: Contacts.SortTypes.FirstName,
        });

        if (data.length > 0) {
          // Format contacts to include phone number in a simpler format
          const formattedContacts = data
            .map((contact) => {
              // Get first phone number if available
              const phoneNumber =
                contact.phoneNumbers && contact.phoneNumbers.length > 0
                  ? contact.phoneNumbers[0].number
                  : undefined;

              return {
                ...contact,
                phoneNumber,
              };
            })
            .filter((contact) => contact.phoneNumber); // Only include contacts with phone numbers

          // Store contacts in state
          setContacts(formattedContacts);
          setShowContactsList(true); // Show the contacts list UI
          console.log('Contacts synchronized:', formattedContacts.length);
          Alert.alert('Success', `${formattedContacts.length} contacts synchronized`);
        } else {
          console.log('No contacts found');
          Alert.alert('No Contacts', 'No contacts found on your device');
        }
      } else {
        console.log('Permission denied');
        Alert.alert(
          'Permission Denied',
          'Unable to access contacts. Please enable permission in settings.'
        );
      }
    } catch (error) {
      console.error('Error accessing contacts:', error);
      Alert.alert('Error', 'Failed to access contacts. Please try again.');
    } finally {
      setContactSyncLoading(false);
      setShowContactModal(false);
    }
  };

  const getLimitedContacts = async () => {
    setContactSyncLoading(true);

    try {
      // Request permission to access contacts
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === 'granted') {
        // Simulate opening a contact picker by showing a message
        // In a real app, you would use a proper contact picker here
        setTimeout(() => {
          Alert.alert(
            'Contact Picker',
            'In a real app, this would open a contact picker to select specific contacts.'
          );
          console.log('Contact picker would be shown here');
        }, 1000);
      } else {
        console.log('Permission denied');
        Alert.alert(
          'Permission Denied',
          'Unable to access contacts. Please enable permission in settings.'
        );
      }
    } catch (error) {
      console.error('Error accessing contacts:', error);
      Alert.alert('Error', 'Failed to access contacts. Please try again.');
    } finally {
      setContactSyncLoading(false);
      setShowContactModal(false);
    }
  };

  const handleContactAccess = (accessType: 'full' | 'limited' | 'none') => {
    // Handle different contact access permissions
    if (accessType === 'none') {
      // Just close the modal
      setShowContactModal(false);
      return;
    }

    if (accessType === 'full') {
      // Get all contacts
      getFullContacts();
    } else if (accessType === 'limited') {
      // Get limited contacts with picker
      getLimitedContacts();
    }
  };

  // Handle contact selection
  const onContactSelect = (contact: ContactWithState) => {
    if (!contact.phoneNumber) {
      Alert.alert('Invalid Contact', 'Selected contact has no phone number');
      return;
    }

    // Use the Zustand store instead of URL params
    startTransfer({
      recipientName: contact.name || 'Contact',
      mobileNumber: contact.phoneNumber,
      transactionType: 'Fund Transfer' as TransactionType,
    });

    // Navigate to payment page without params
    router.push('/account/payment');
  };

  return (
    <View className="flex-1 bg-white pt-10">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 pt-12">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-semibold text-gray-800">
          Mobile Transfer
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content */}
      <View className="flex-1">
        {/* Search Bar */}
        <View className="px-4 py-2">
          <View className="flex-row items-center rounded-full bg-gray-100 px-4 py-3">
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              className="ml-2 flex-1 text-base text-gray-700"
              placeholder="Search by name or mobile number"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Conditional rendering based on whether contacts are synced */}
        {!showContactsList ? (
          // Show Send Money UI when no contacts synced
          <View className="flex-1 items-center justify-center px-4">
            <Text className="mb-3 text-3xl font-bold text-gray-800">
              Transfer to a mobile number
            </Text>
            <Text className="mb-10 text-center text-lg text-gray-500">
              Please enter a registered DuitNow mobile number
            </Text>

            {/* Sync Contacts Button */}
            <TouchableOpacity
              className="rounded-full bg-primary px-8 py-3"
              onPress={handleSyncContacts}>
              <Text className="text-lg font-semibold text-white">Sync my contacts</Text>
            </TouchableOpacity>

            {/* Show number of synced contacts if any */}
            {contacts.length > 0 && (
              <Text className="mt-4 text-sm text-gray-500">{contacts.length} contacts synced</Text>
            )}
          </View>
        ) : (
          // Show Contacts List when contacts are synced
          <View className="flex-1">
            {/* CONTACTS Header */}
            <Text className="mb-4 px-4 text-xl font-bold text-gray-500">CONTACTS</Text>

            {/* Contacts List */}
            <ScrollView className="flex-1 px-4">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact, index) => (
                  <TouchableOpacity
                    key={contact.id || index}
                    className="mb-4 flex-row items-center"
                    onPress={() => onContactSelect(contact)}>
                    {/* Contact Avatar */}
                    <View className="h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                      <Ionicons name="person" size={24} color="#888" />
                    </View>

                    {/* Contact Info */}
                    <View className="ml-4 flex-1">
                      <Text className="text-lg font-medium text-gray-800">{contact.name}</Text>
                      <Text className="text-gray-500">{contact.phoneNumber}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="mt-4 text-center text-gray-500">
                  No contacts found matching &quot;{searchQuery}&quot;
                </Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Contact Access Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showContactModal}
        onRequestClose={() => setShowContactModal(false)}>
        <View className="flex-1 items-center justify-center bg-black bg-opacity-50">
          <View className="w-4/5 rounded-xl bg-white p-5">
            <Text className="mb-4 text-center text-xl font-bold">Contacts Access</Text>
            <Text className="mb-4 text-center text-gray-600">
              Allow RytBank to access your contacts to make transfers easier?
            </Text>

            <View className="gap-3">
              <TouchableOpacity
                className="rounded-xl bg-primary py-3"
                onPress={() => handleContactAccess('full')}>
                <Text className="text-center font-semibold text-white">Allow full access</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-xl bg-gray-200 py-3"
                onPress={() => handleContactAccess('limited')}>
                <Text className="text-center font-semibold text-gray-700">
                  Select contacts only
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-xl bg-gray-100 py-3"
                onPress={() => handleContactAccess('none')}>
                <Text className="text-center font-semibold text-gray-500">Don&apos;t allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading overlay */}
      {contactSyncLoading && <Loader text="Syncing contacts..." />}
    </View>
  );
}
