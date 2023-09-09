import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Toast from 'react-native-toast-message';
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";

const Stack = createNativeStackNavigator();
export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{title: 'Login'}}/>
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{title: 'Welcome'}}/>
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
