import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';

type PinInputProps = {
  onComplete: (pin: string) => void;
  onCancel?: () => void;
  error?: string | React.ReactNode;
};

export default function PinInput(props: PinInputProps) {
  // Using functions to access props instead of direct access
  function handleComplete(pin: string) {
    if (props && typeof props.onComplete === 'function') {
      props.onComplete(pin);
    }
  }

  function handleCancel() {
    if (props && typeof props.onCancel === 'function') {
      props.onCancel();
    }
  }

  const [pin, setPin] = useState<string>('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Clear PIN when error occurs
  useEffect(() => {
    if (props.error) {
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Clear PIN after shake animation
      setTimeout(() => {
        setPin('');
      }, 300);
    }
  }, [props.error]);

  const handleNumberPress = (number: string) => {
    if (pin.length < 6) {
      const newPin = pin + number;
      setPin(newPin);

      if (newPin.length === 6) {
        handleComplete(newPin);
      }
    }
  };

  const handleDeletePress = () => {
    setPin(pin.slice(0, -1));
  };

  const renderPinDots = () => {
    const dots = [];
    for (let i = 0; i < 6; i++) {
      dots.push(
        <View
          key={i}
          style={{ marginLeft: i > 0 ? 12 : 0 }}
          className={`h-3 w-3 rounded-full border ${
            pin.length > i ? 'border-white bg-white' : 'border-gray-500'
          }`}
        />
      );
    }
    return dots;
  };

  const renderNumber = (number: string, letters?: string) => (
    <TouchableOpacity
      key={number}
      style={{ marginLeft: number === '2' || number === '5' || number === '8' ? 16 : 0 }}
      className="mb-6 h-[75px] w-[75px] items-center justify-center rounded-full bg-[#4B4B4B]"
      onPress={() => handleNumberPress(number)}>
      <View>
        <Text className="text-3xl font-light text-white">{number}</Text>
        {letters && <Text className="text-center text-[10px] text-gray-400">{letters}</Text>}
      </View>
    </TouchableOpacity>
  );

  // Local function to render error to avoid direct prop access
  const renderError = () => {
    if (!props.error) return null;

    if (typeof props.error === 'string') {
      return <Text className="mb-6 text-center text-sm text-red-500">{props.error}</Text>;
    }

    return props.error;
  };

  return (
    <View className="flex-1 bg-black px-6 pt-20">
      {/* Title and Subtitle */}
      <View className="mb-12 items-center">
        <Text className="mb-2 text-2xl text-white">Enter iPhone Passcode for</Text>
        <Text className="mb-4 text-2xl font-light text-white">Ryt Bank</Text>
        <Text className="text-base text-white">Local authentication is required.</Text>
      </View>

      {/* PIN Dots */}
      <Animated.View
        className="mb-16 flex-row justify-center"
        style={{ transform: [{ translateX: shakeAnim }] }}>
        {renderPinDots()}
      </Animated.View>

      {/* Error Message */}
      {renderError()}

      {/* Number Pad */}
      <View className="mt-8 items-center">
        {/* Row 1-3 */}
        <View className="mb-6 flex-row justify-center">
          {renderNumber('1')}
          {renderNumber('2', 'ABC')}
          <TouchableOpacity
            style={{ marginLeft: 16 }}
            className="mb-6 h-[75px] w-[75px] items-center justify-center rounded-full bg-[#4B4B4B]"
            onPress={() => handleNumberPress('3')}>
            <View>
              <Text className="text-3xl font-light text-white">3</Text>
              <Text className="text-center text-[10px] text-gray-400">DEF</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View className="mb-6 flex-row justify-center">
          {renderNumber('4', 'GHI')}
          {renderNumber('5', 'JKL')}
          <TouchableOpacity
            style={{ marginLeft: 16 }}
            className="mb-6 h-[75px] w-[75px] items-center justify-center rounded-full bg-[#4B4B4B]"
            onPress={() => handleNumberPress('6')}>
            <View>
              <Text className="text-3xl font-light text-white">6</Text>
              <Text className="text-center text-[10px] text-gray-400">MNO</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View className="mb-6 flex-row justify-center">
          {renderNumber('7', 'PQRS')}
          {renderNumber('8', 'TUV')}
          <TouchableOpacity
            style={{ marginLeft: 16 }}
            className="mb-6 h-[75px] w-[75px] items-center justify-center rounded-full bg-[#4B4B4B]"
            onPress={() => handleNumberPress('9')}>
            <View>
              <Text className="text-3xl font-light text-white">9</Text>
              <Text className="text-center text-[10px] text-gray-400">WXYZ</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Row */}
        <View className="flex-row items-center">
          <View style={{ width: 91 }} /> {/* Spacer for alignment */}
          <TouchableOpacity
            className="h-[75px] w-[75px] items-center justify-center rounded-full bg-[#4B4B4B]"
            onPress={() => handleNumberPress('0')}>
            <Text className="text-3xl font-light text-white">0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 16, width: 75 }}
            className="h-[75px] items-center justify-center"
            onPress={pin.length > 0 ? handleDeletePress : handleCancel}>
            <Text className="text-lg text-white">{pin.length > 0 ? 'Delete' : 'Cancel'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
