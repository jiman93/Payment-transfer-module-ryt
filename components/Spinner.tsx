import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

type SpinnerProps = {
  size?: 'small' | 'large';
  text?: string;
};

export default function Spinner({ size = 'large', text }: SpinnerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.spinnerBox}>
        <ActivityIndicator size={size} color="#5271FF" />
        {text && <Text className="mt-2 text-center text-gray-600">{text}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  spinnerBox: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
});
