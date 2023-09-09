import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createDrawerNavigator} from "@react-navigation/drawer";
import Toast from 'react-native-toast-message';
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import React, { useState } from 'react';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerScreens(){
  return (
    <Drawer.Navigator>
        <Drawer.Screen name = "Home" component = {HomeScreen} />
        <Drawer.Screen name = "Logout" component = {LoginScreen} options={{ headerShown: false }} />
    </Drawer.Navigator>
  )
}

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen">
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="HomeScreenWithDrawer" component={DrawerScreens} headerLeft={null} gestureEnabled={false} options={{ headerShown: false }}/>
          <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{ title : 'Reset Password' }} />
        </Stack.Navigator>
        <Toast/>
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
