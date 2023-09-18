import React , { useState, useEffect } from 'react';
import { View, FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ListItem, Button, CheckBox, Card, Avatar, Image, Text } from '@rneui/themed';
import { clearStorage, getUser, getUserType } from '../../helpers/LocalStorage';
import Toast from "react-native-toast-message";
import { cartApi } from '../../helpers/api';
import Background from '../../components/Background';
import { useIsFocused } from '@react-navigation/native';


export const CartScreen = ({navigation}) => {
    const [user, setUser] = useState('');
    const [cartItems, setCartItems] = useState([]); 
    const [user_type, setUserType] = useState('');
    const [deletion, setDeletion] = useState(false);
    const [itemChecked, setItemChecked] = useState([false]); //Might not work since caritems have to be fetched first
    const [totalPrice, setTotalPrice] = useState(0);
    const isFocused = useIsFocused();

  function formatDateAndTime(date) {
    const options = {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',

    };
  
    const formattedDate = new Date(date).toLocaleString(undefined, options);
    return formattedDate;
  }

  const checkout = async () => {
    const booking_ids = [];
      const selectedCartItems = [];
      itemChecked.forEach((isChecked, index) => {
        if (isChecked) {
            console.log("WATTT " + cartItems[index])
            console.log(cartItems[index])
            booking_ids.push(cartItems[index].id);
            selectedCartItems.push(cartItems[index]);
        }
    });

    if (selectedCartItems.length > 0) {
    
        console.log(booking_ids)
        navigation.navigate('CheckoutScreen', { booking_ids, selectedCartItems, totalPrice });
    } 

    // Should give warning

  
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
        // Should navigate to Bookings Screen?
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

const getFields = (cartItems) => {
    let subtotal = 0;
    const selections = [];
    const quantities = [];

    cartItems.forEach((cartItem) => {

        subtotal += (cartItem.price * cartItem.quantity);
        selections.push(cartItem.activity_selection);
        quantities.push(cartItem.quantity);
      });


    return { subtotal, selections, quantities };
}
    

const handleCheckBoxToggle = (index) => {
    const updatedChecked = [...itemChecked];
    if (updatedChecked[index]) {
        const cartItem = cartItems[index];
        const newPrice = totalPrice - parseFloat(cartItem.price);
        setTotalPrice(newPrice);
    } else {
        const cartItem = cartItems[index];
        const newPrice = totalPrice + parseFloat(cartItem.price);
        setTotalPrice(newPrice);
    }

    updatedChecked[index] = !updatedChecked[index];
    setItemChecked(updatedChecked);
    
  };

  const isAllChecked = () => {

    return itemChecked.every((isChecked) => isChecked);
  };

  const handleCheckAllToggle = () => {
    const updatedChecked = itemChecked.map(() => !isAllChecked());
    if (isAllChecked()) {
        setTotalPrice(0);
    } else {
        let newPrice = 0;
        cartItems.forEach((cartItem) => {
            newPrice += parseFloat(cartItem.price);
        });
        setTotalPrice(newPrice);
    }
    setItemChecked(updatedChecked);
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
                console.log(detail)
                //console.log(detail.attraction.attraction_id)
                const { subtotal, selections, quantities } = getFields(detail.cart_item_list);
  
                return {
                    id: parseInt(detail.cart_booking_id),
                    type: detail.type,
                    attraction_id: detail.attraction.attraction_id,
                    image: detail.attraction.attraction_image_list[0],
                    item_name: detail.activity_name, // Needs to be conditional
                    activity_name: detail.attraction.name, // Needs to be conditional
                    startTime: formatDateAndTime(detail.start_datetime),
                    endTime: formatDateAndTime(detail.end_datetime),
                    items: detail.cart_item_list, // get activity selection
                    price: subtotal.toFixed(2),
                    quantity: quantities,
                    selections: selections
                    //price: detail.price.toFixed(2),

                    };
              })
              setCartItems(extractedDetails);
              if (extractedDetails.length > 0) {
                setItemChecked(Array(extractedDetails.length).fill(false));
              } 
              
              
          }


      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    }

    onLoad();
  }, [deletion,isFocused]);

  

  return (
    <View>

    
    <ScrollView>
    <View>
      {
          cartItems.map((cartItem, index) => (
            
          <ListItem.Swipeable
            shouldCancelWhenOutside={false} 
            rightWidth={90}
            minSlideWidth={40}
            key={index}
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
      iconType="material-community"
           checkedIcon="checkbox-outline"
           uncheckedIcon={'checkbox-blank-outline'}
      containerStyle={{ marginLeft: -10, marginRight: -10, padding: 0 }}
      checked={itemChecked[index]}
      onPress={() => handleCheckBoxToggle(index)}
      
    />
    
     <TouchableOpacity style={{ flexDirection: "row" }}
              onPress={() => {
                navigation.navigate('AttractionDetailsScreen', {
                    attractionId: cartItem.attraction_id,
                });
              }}
            >
            
    <Image
                                    
                                    source={{
                                    uri: cartItem.image// KIV for image 
                                    }}
                                    style={{ width: 75, height: 75, borderRadius: 10, marginLeft: 0, marginRight: 0}}
                                />
            <ListItem.Content style={{padding: 0, margin: 0}}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "column" }}>
              <ListItem.Title>{cartItem.item_name}</ListItem.Title>
              <ListItem.Subtitle>{cartItem.startTime} - {cartItem.endTime}</ListItem.Subtitle>
              <ListItem.Subtitle>${cartItem.price}</ListItem.Subtitle>
              {/* <ListItem.Subtitle>{cartItem.quantity}</ListItem.Subtitle> */}
              
              </View>
              <View style={{ flexDirection: "column" }}>
              {
          cartItem.items.map((item, index) => (
            <Text key={index}>{item.activity_selection} Quantity: {item.quantity}</Text> 
          ))

          }
              
              </View>
              </View>       
            </ListItem.Content>
            </TouchableOpacity>
            
            
          </ListItem.Swipeable>
        ))}

        
    
      
        
    </View>
    </ScrollView>


    
       <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'lightblue', padding: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <CheckBox
      left
      iconType="material-community"
           checkedIcon="checkbox-outline"
           uncheckedIcon={'checkbox-blank-outline'}
      title="All"
      style={{ borderWidth: 0, margin: 0, padding: 0 }}
      containerStyle={{ borderWidth: 0, margin: 0, padding: 0, backgroundColor: 'transparent' }}
      checked={isAllChecked()} // Check if all items are checked
     onPress={handleCheckAllToggle}
      
    />
        <Text>Total Price: ${totalPrice.toFixed(2)}</Text>
      </View>
      <Button title="Checkout" onPress={() => {
        checkout();
      }} />
    </View>

      </View>
  );

 
  
};
