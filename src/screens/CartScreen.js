import React , { useState, useEffect } from 'react';
import { View, FlatList, ScrollView } from 'react-native';
import { ListItem, Button, CheckBox } from '@rneui/themed';
import { clearStorage, getUser, getUserType } from '../helpers/LocalStorage';
import Toast from "react-native-toast-message";
import { cartApi } from '../helpers/api';


export const CartScreen = ({navigation}) => {
    const [user, setUser] = useState('');
    const [cartItems, setCartItems] = useState([]); 
    const [user_type, setUserType] = useState('');
    const [deletion, setDeletion] = useState(false);

  function formatDateAndTime(date) {
    const options = {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
  
    const formattedDate = new Date(date).toLocaleString(undefined, options);
    return formattedDate;
  }

  const checkout = async () => {
    const booking_ids = [];
    cartItems.forEach((cartItem) => {
        booking_ids.push(cartItem.id);
    })
    const tourist_email = user.email;
    const response = await cartApi.put(`/checkoutCart/${user_type}/${tourist_email}`, booking_ids)
    if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
      console.log('error',response.data)

  } else {
    console.log('success', response.data)
    if (response.data) {
        navigation.navigate('CartScreen');
        setDeletion(!deletion);
      Toast.show({
        type: 'success',
        text1: 'Successfully checked out cart item(s)'
    });
    
    } else {
      Toast.show({
        type: 'error',
        text1: 'Unable to checkout cart item(s)'
    });
    }
    }

  }

  const handleDeleteCartItem = async (cart_item_id) => {
    
    const tourist_email = user.email;
    const cart_item_ids = [cart_item_id];
    console.log(cart_item_ids)
    const response = await cartApi.put(`/deleteCartItems/${user_type}/${tourist_email}`,cart_item_ids)
    if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
      console.log('error',response.data)

  } else {
    console.log('success', response.data)
    if (response.data) {
        navigation.navigate('CartScreen');
        setDeletion(!deletion);
      Toast.show({
        type: 'success',
        text1: 'Successfully deleted cart item(s)'
    });
    
    } else {
      Toast.show({
        type: 'error',
        text1: 'Unable to delete cart item(s)'
    });
    }
  }

};

  useEffect(() => {
    async function onLoad() {

      try {
        
        const user_type = await getUserType();
        const userData = await getUser()
        setUser(userData)
        setUserType(user_type)
        const tourist_email = userData.email
        const response = await cartApi.get(`/viewCart/${user_type}/${tourist_email}`)
          if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
              console.log('error',response.data)

          } else {
              console.log(response.data)
              const cartDetails = response.data;
              const extractedDetails = cartDetails.map((detail) => {
                console.log(detail.booking_id)
                console.log(detail.activity_selection);
                console.log(detail.attraction.price_list)
                console.log(user_type)


                const localPrice = priceItem ? priceItem.local_amount : 0;
                const touristPrice = priceItem ? priceItem.tourist_amount : 0;
                console.log(priceItem)
                console.log(detail.type)
                return {
                    id: parseInt(detail.booking_id),
                    type: detail.type,
                    item_name: detail.activity_selection, // Needs to be conditional
                    activity_name: detail.attraction.name, // Needs to be conditional
                    //image: detail.attraction.attraction_image_list[0],
                    quantity: parseInt(detail.quantity),
                    startTime: formatDateAndTime(detail.start_datetime),
                    endTime: formatDateAndTime(detail.end_datetime),
                    //price: detail.price.toFixed(2),

                    };
              })
              setCartItems(extractedDetails);
              
          }


      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    }

    onLoad();
  }, [deletion]);


  return (
    <ScrollView>
    <View>
      {
          cartItems.map((cartItem) => (
          <ListItem.Swipeable
            shouldCancelWhenOutside={false} 
            rightWidth={90}
            minSlideWidth={40}
            key={cartItem.id}
            rightContent={
                <Button
                containerStyle={{
                  flex: 1,
                  justifyContent: "center",
                  backgroundColor: "#DC143C",
                }}
                type="clear"
                icon={{ name: "delete-outline" }}
                onPress={() => {
                  handleDeleteCartItem(cartItem.id);
     
                }}
              />
            }
          >
            <CheckBox
      left
      checkedIcon="dot-circle-o"
      uncheckedIcon="circle-o"
      //checked={check2}
      //onPress={() => setCheck2(!check2)}
    />
            <ListItem.Content>
              <ListItem.Title>{cartItem.item_name}</ListItem.Title>
              <ListItem.Subtitle>${cartItem.price}</ListItem.Subtitle>
              <ListItem.Subtitle>{cartItem.quantity}</ListItem.Subtitle>
              <ListItem.Subtitle>Start: {cartItem.startTime}</ListItem.Subtitle>
              <ListItem.Subtitle>End: {cartItem.endTime}</ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem.Swipeable>
        ))}

        <Button title="Checkout" onPress={() => {
                  checkout();
                }} />
    
      
        
    </View>
    </ScrollView>
  );
};
