import { StyleSheet } from 'react-native';
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Toast from 'react-native-toast-message';
import {HomeScreen} from "./src/screens/HomeScreen";
import {LoginScreen} from "./src/screens/LoginScreen";
import {CodeVerificationScreen} from "./src/screens/CodeVerificationScreen";
import {ResetPasswordScreen} from "./src/screens/ResetPasswordScreen";
import {ForgotPasswordScreen} from "./src/screens/ForgotPasswordScreen";

const Stack = createNativeStackNavigator();
export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{title: 'Login'}}/>
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{title: 'Welcome'}}/>
            <Stack.Screen name="CodeVerificationScreen" component={CodeVerificationScreen} options={{title: 'Verify Code'}}/>
            <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{title: 'Reset Password'}}/>
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{title: 'Forgot Password'}}/>
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
