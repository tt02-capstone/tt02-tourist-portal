import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Toast from 'react-native-toast-message';
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import CheckoutScreen from "./src/screens/Ticket and Booking/CheckoutScreen";
import { initStripe } from '@stripe/stripe-react-native';

initStripe({
  // API Key is test key, will be masked via GitHub Actions for deployment
  publishableKey: 'pk_test_51NmFq8JuLboRjh4q4oxGO4ZUct2x8EzKnOtukgnrwTU2rr7A8AcL33OpPxtxGPLHoqCspNQtRA0M1P1uuaViRXNF00HZxqJgEg',
});

const Stack = createNativeStackNavigator();
export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{title: 'Welcome'}}/>
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{title: 'Login'}}/>
            <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} options={{title: 'Test Checkout'}}/>
        </Stack.Navigator>
          <Toast />
      </NavigationContainer>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
