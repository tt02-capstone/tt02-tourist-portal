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

    if (isLoginScreen || isCartScreen || isCheckoutScreen || isSignUpScreen) {
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
              size={40}
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