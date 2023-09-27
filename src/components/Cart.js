import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon, Button, Text} from '@rneui/themed';

export const Cart = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const isLoginScreen = route.name === 'LoginScreen';
    const isCartScreen = route.name === 'CartScreen';
    const isCheckoutScreen = route.name === 'CheckoutScreen';
    const isSignUpScreen = route.name === 'SignUpScreen';

/*     <Stack.Screen name="CodeVerificationScreen" component={CodeVerificationScreen}
    options={{title: 'Verify Code'}}/>
<Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen}
    options={{title: 'Reset Password'}}/>
<Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen}
    options={{title: 'Forgot Password'}}/>
<Stack.Screen name="EmailVerificationScreen" component={EmailVerificationScreen}
    options={{title: 'Verify Email'}}/> */
    const isCodeVerificationScreen = route.name === 'CodeVerificationScreen';
    const isResetPasswordScreen = route.name === 'ResetPasswordScreen';
    const isForgotPasswordScreen = route.name === 'ForgotPasswordScreen';
    const isEmailVerificationScreen = route.name === 'EmailVerificationScreen';

    if (isLoginScreen || isCartScreen || isCheckoutScreen || isSignUpScreen || isCodeVerificationScreen 
      || isResetPasswordScreen || isForgotPasswordScreen || isEmailVerificationScreen) {
        return null;
      }


      if (!isCartScreen) {
        return (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('CartScreen'); 
            }}
            style={{ marginRight: 20 }} 
          >
            <Icon
              color="#000000"
              name="shopping-cart"
              size={20}
              type="font-awesome"
            />
          </TouchableOpacity>
        );
      } else {
        // Render something else or return null
        return (
          <View>
{/* onPress={() => navigation.navigate('Details')} */}
      <Button title="Delete" onPress={{handleDeleteCartItem}}/>
    </View>
        );
      }
    }