import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FAB,Icon } from '@rneui/themed';

export const Cart = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const isLoginScreen = route.name === 'LoginScreen';
    const isCartScreen = route.name === 'CartScreen';

    if (isLoginScreen || isCartScreen) {
        return null;
      }


    return (

        <TouchableOpacity
      onPress={() => {
        navigation.navigate('CartScreen'); 
      }}
      style={{ marginRight: 20 }} 
    >
    
        <Icon
        color="#000000"
        containerStyle={{}}
        disabledStyle={{}}
        iconProps={{}}
        iconStyle={{}}
        name="shopping-cart"
        
        size={40}
        type="font-awesome"
        />

        </TouchableOpacity>
    
    )
    }