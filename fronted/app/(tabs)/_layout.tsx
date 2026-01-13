import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { Text } from 'react-native';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Orbitron: require('../../assets/fonts/Orbitron-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return <Text />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
