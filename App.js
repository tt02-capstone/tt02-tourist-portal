import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from 'react-native-toast-message';
import HomeScreen from './src/screens/HomeScreen';
import { LoginScreen } from "./src/screens/LoginScreen";
import { ResetPasswordScreen } from "./src/screens/ResetPasswordScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { SignUpScreen } from "./src/screens/SignUpScreen";
import { CodeVerificationScreen } from "./src/screens/CodeVerificationScreen";
import { ViewProfileScreen } from './src/screens/Profile/ViewProfileScreen';
import { EditProfileScreen } from './src/screens/Profile/EditProfileScreen';
import { EditPasswordScreen } from './src/screens/Profile/EditPasswordScreen';
import AttractionScreen from './src/screens/AttractionScreen';
import AttractionDetailsScreen from './src/screens/AttractionDetails';
import BookingHistoryScreen from './src/screens/BookingHistoryScreen';
import BookingDetailsScreen from './src/screens/BookingDetailsScreen';
import PaymentHistoryScreen from './src/screens/PaymentHistoryScreen';
import {CreditCardsScreen} from "./src/screens/CreditCard/CreditCardsScreen"
import {AddCreditCardScreen} from './src/screens/CreditCard/AddCreditCardScreen';
import {CreditCardScreen} from './src/screens/CreditCard/CreditCardScreen';
import { initStripe } from '@stripe/stripe-react-native';

initStripe({
  // API Key is test key, will be masked via GitHub Actions for deployment
  publishableKey: 'pk_test_51NmFq8JuLboRjh4q4oxGO4ZUct2x8EzKnOtukgnrwTU2rr7A8AcL33OpPxtxGPLHoqCspNQtRA0M1P1uuaViRXNF00HZxqJgEg',
});

const Stack = createNativeStackNavigator();
export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen">
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{title: 'Login '}}/>
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{title: 'Home '}}/>
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{title: 'Sign Up '}}/>
            <Stack.Screen name="CodeVerificationScreen" component={CodeVerificationScreen} options={{title: 'Verify Code'}}/>
            <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{title: 'Reset Password'}}/>
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{title: 'Forgot Password'}}/>
            <Stack.Screen name="ViewProfileScreen" component={ViewProfileScreen} options={{title: 'View Profile'}}/>
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{title: 'Edit Profile'}}/>
            <Stack.Screen name="EditPasswordScreen" component={EditPasswordScreen} options={{title: 'Edit Password'}}/>
            <Stack.Screen name="AttractionScreen" component={AttractionScreen} options={{ title : 'Attractions' }} />
            <Stack.Screen name="AttractionDetailsScreen" component={ AttractionDetailsScreen} options={{ title : 'Attractions' }} />
            <Stack.Screen name="BookingHistoryScreen" component={ BookingHistoryScreen} options={{ title : 'Booking History' }} />
            <Stack.Screen name="BookingDetailsScreen" component={ BookingDetailsScreen} options={{ title : 'Booking Details' }} />
            <Stack.Screen name="PaymentHistoryScreen" component={ PaymentHistoryScreen} options={{ title : 'Payment History' }} /> 
            <Stack.Screen name="CreditCardsScreen" component={CreditCardsScreen} options={{title: 'My Credit Cards'}}/>
            <Stack.Screen name="AddCreditCardScreen" component={AddCreditCardScreen} options={{title: 'Add Credit Card'}}/>
            <Stack.Screen name="CreditCardScreen" component={CreditCardScreen} options={{title: 'View Credit Card'}}/>
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
