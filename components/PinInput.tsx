import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';

type PinInputProps = {
  onComplete: (pin: string) => void;
  onCancel?: () => void;
  error?: string | React.ReactNode;
};

export default function PinInput(props: PinInputProps) {
  // Using functions to access props instead of direct access
  function handleComplete(pinString: string) {
    if (props && typeof props.onComplete === 'function') {
      props.onComplete(pinString);
    }
  }

  function handleCancel() {
    if (props && typeof props.onCancel === 'function') {
      props.onCancel();
    }
  }

  // Initialize state directly with typed empty array
  const [pinDigits, setPinDigits] = useState<number[]>([]);
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
        setPinDigits([]);
      }, 300);
    }
  }, [props.error]);

  const handleNumberPress = (number: string) => {
    if (pinDigits.length < 6) {
      const digit = parseInt(number, 10);
      const newPinDigits = [...pinDigits, digit];
      setPinDigits(newPinDigits);

      const newPinString = newPinDigits.join('');
      if (newPinString.length === 6) {
        handleComplete(newPinString);
      }
    }
  };

  const handleDeletePress = () => {
    setPinDigits(pinDigits.slice(0, -1));
  };

  const renderPinDots = () => {
    const dots = [];
    for (let i = 0; i < 6; i++) {
      dots.push(
        <View
          key={i}
          style={{ marginLeft: i > 0 ? 12 : 0 }}
          className={`h-3 w-3 rounded-full border ${
            pinDigits.length > i ? 'border-white bg-white' : 'border-gray-500'
          }`}
        />
      );
    }
    return dots;
  };

  const renderNumber = (number: string, letters?: string, isThirdColumn = false) => (
    <TouchableOpacity
      key={number}
      style={{
        marginLeft: isThirdColumn
          ? 16
          : number === '2' || number === '5' || number === '8'
            ? 16
            : 0,
      }}
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

  // Create text elements for the header
  const titleText = <Text className="mb-2 text-2xl text-white">Enter iPhone Passcode for</Text>;
  const bankText = <Text className="mb-4 text-2xl font-light text-white">Ryt Bank</Text>;
  const subtitleText = (
    <Text className="text-base text-white">Local authentication is required.</Text>
  );

  // Create text elements for the buttons
  const deleteText = <Text className="text-lg text-white">Delete</Text>;
  const cancelText = <Text className="text-lg text-white">Cancel</Text>;
  const number0Text = <Text className="text-3xl font-light text-white">0</Text>;

  return (
    <View className="flex-1 bg-black px-6 pt-20">
      <View className="mb-12 items-center">
        {titleText}
        {bankText}
        {subtitleText}
      </View>

      <Animated.View
        className="mb-16 flex-row justify-center"
        style={{ transform: [{ translateX: shakeAnim }] }}>
        {renderPinDots()}
      </Animated.View>

      {renderError()}

      <View className="mt-8 items-center">
        <View className="mb-6 flex-row justify-center">
          {renderNumber('1')}
          {renderNumber('2', 'ABC')}
          {renderNumber('3', 'DEF', true)}
        </View>

        <View className="mb-6 flex-row justify-center">
          {renderNumber('4', 'GHI')}
          {renderNumber('5', 'JKL')}
          {renderNumber('6', 'MNO', true)}
        </View>

        <View className="mb-6 flex-row justify-center">
          {renderNumber('7', 'PQRS')}
          {renderNumber('8', 'TUV')}
          {renderNumber('9', 'WXYZ', true)}
        </View>

        <View className="flex-row items-center">
          <View style={{ width: 91 }} />
          <TouchableOpacity
            className="h-[75px] w-[75px] items-center justify-center rounded-full bg-[#4B4B4B]"
            onPress={() => handleNumberPress('0')}>
            {number0Text}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 16, width: 75 }}
            className="h-[75px] items-center justify-center"
            onPress={pinDigits.length > 0 ? handleDeletePress : handleCancel}>
            {pinDigits.length > 0 ? deleteText : cancelText}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
