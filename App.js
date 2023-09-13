import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Toast from 'react-native-toast-message';
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import AttractionScreen from './src/screens/AttractionScreen';
import AttractionDetailsScreen from './src/screens/AttractionDetails';

const Stack = createNativeStackNavigator();
export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen">
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{title: 'Exploration'}}/>
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{title: 'Login'}}/>
            <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{ title : 'Reset Password' }} />
            <Stack.Screen name="AttractionScreen" component={AttractionScreen} options={{ title : 'Attractions' }} />
            <Stack.Screen name="AttractionDetailsScreen" component={ AttractionDetailsScreen} options={{ title : 'Attractions' }} />
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
