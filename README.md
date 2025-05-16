# RytBank

A React Native banking application built with Expo.

## Project Documentation

For complete project documentation, requirements, and specifications, visit the project's Notion site:

[Ryt Bank Project Documentation](https://dented-surprise-5c0.notion.site/Ryt-Bank-Take-Home-1f3a73077ef48010a062f71ef3cffd1d)

## Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for mobile testing)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rytbank-zul.git
cd rytbank-zul
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Running the Application

### Start the development server:

```bash
npm start
# or
yarn start
```

This will start the Expo development server and show you a QR code and options to run the app.

### To run on iOS:

```bash
npm run ios
# or
yarn ios
```

### To run on Android:

```bash
npm run android
# or
yarn android
```

### To run on web:

```bash
npm run web
# or
yarn web
```

## Default Credentials

When testing the application, you can use the following default pin:

- PIN: `123456`

## Development Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator or device
- `npm run ios` - Run on iOS simulator or device
- `npm run web` - Run in web browser
- `npm run lint` - Run linting checks
- `npm run format` - Format code using ESLint and Prettier
- `npm run prebuild` - Run Expo prebuild

## Technologies Used

- React Native
- Expo
- React Navigation
- NativeWind (TailwindCSS for React Native)
- Zustand (State Management)
- React Hook Form 