import { LogBox } from 'react-native';

/**
 * Disable the React Native error overlay in development
 *
 * This can be imported in a main file to disable the error overlay
 * or specific error messages can be suppressed.
 */
export const disableErrorOverlay = () => {
  // Disable all error messages
  LogBox.ignoreAllLogs();

  // Or ignore specific warnings/errors (uncomment to use)
  // LogBox.ignoreLogs([
  //   'Account fetch error',
  //   'Network error',
  //   // Add more error message patterns to ignore
  // ]);
};
