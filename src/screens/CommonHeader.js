import React from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import { TouchableOpacity, View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Icon } from '@rneui/themed';

export const CommonHeader = () => {

    const route = useRoute();
    const navigation = useNavigation();
    const isLoginScreen = route.name === 'LoginScreen';
    const isCartScreen = route.name === 'CartScreen';
    const isNotificationScreen = route.name === 'NotificationScreen';
    const isCheckoutScreen = route.name === 'CheckoutScreen';
    const isSignUpScreen = route.name === 'SignUpScreen';
    const isCodeVerificationScreen = route.name === 'CodeVerificationScreen';
    const isResetPasswordScreen = route.name === 'ResetPasswordScreen';
    const isForgotPasswordScreen = route.name === 'ForgotPasswordScreen';
    const isEmailVerificationScreen = route.name === 'EmailVerificationScreen';

    if (isLoginScreen || isCartScreen || isCheckoutScreen || isSignUpScreen || isCodeVerificationScreen || isResetPasswordScreen || isForgotPasswordScreen || isEmailVerificationScreen) {
        return null;
    }

    if (!isCartScreen && !isNotificationScreen) {
        return (
            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                    onPress={() => {
                    navigation.navigate('NotificationScreen'); 
                    }}
                    style={{ marginRight: 30 }} 
                >
                    <Ionicons name="notifications" size={20} color='#000000'/>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                    navigation.navigate('CartScreen'); 
                    }}
                    style={{ marginRight: 30 }} 
                >
                   <Icon
                    color="#000000"
                    name="shopping-cart"
                    size={20}
                    type="font-awesome"
                    /> 
                </TouchableOpacity>
            </View>
        );
    } else if (isNotificationScreen) {
        return (
            <TouchableOpacity
                onPress={() => {
                navigation.navigate('CartScreen'); 
                }}
                style={{ marginRight: 30 }} 
            >
            <Icon
                color="#000000"
                name="shopping-cart"
                size={20}
                type="font-awesome"
                /> 
            </TouchableOpacity>
        );
    } else { // anything else
        return (
            <View>
                <Text>Something Else</Text>
            </View>
        );
    }
}