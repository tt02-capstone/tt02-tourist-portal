import React , { useState, useEffect, useRef } from 'react';
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
    const [apiCallTimer, setApiCallTimer] = useState(null);
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


  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button 
          title="Delete" 
          type="error"
          onPress={() => handleDeleteCartItem(user, itemChecked)}
        />
      ),
    });
  }, [navigation, user, itemChecked]);

  const handleDeleteCartItem = async (user,itemChecked) => {
    console.log(user) //There seems to be a bug with the useLayoutEffect, it would not retrieve the user object
    const tourist_email = user.email;
    const booking_ids = [];
      itemChecked.forEach((isChecked, index) => {
        if (isChecked) {
            booking_ids.push(cartItems[index].id);

        }
    });
    console.log(tourist_email,booking_ids)
    const response = await cartApi.put(`/deleteCartItems/${user_type}/${tourist_email}`,booking_ids)
    if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
      console.log('error',response.data)

  } else {
    console.log('success', response.data)
    if (response.data) {

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

  const updateQuantity = (cartItemIndex,itemIndex, delta) => {

    // Update the cart items with new quantity for the specified ticket type
    const currentQuantity = cartItems[cartItemIndex].items[itemIndex].quantity;

    if (currentQuantity + delta >= 0) { // quantity can never go  below 0
      cartItems[cartItemIndex].items[itemIndex].quantity += delta ;
      
      // deal w the pricing change 
      const price = parseFloat(cartItems[cartItemIndex].items[itemIndex].price)
      const difference = price  * delta; // get the change either +ve or - ve
      const newTotalPrice = parseFloat(cartItems[cartItemIndex].price) + difference; // new total price for the list item 
      cartItems[cartItemIndex].price = newTotalPrice.toFixed(2).toString(); // set it back to 2 dp and set as string 

      setCartItems([...cartItems]);
    }

    // Clear any pending API call
    if (apiCallTimer) {
      clearTimeout(apiCallTimer);
    }

    const tourist_email = user.email
      const cart_item_id = cartItems[cartItemIndex].items[itemIndex].cart_item_id;
      const quantity = cartItems[cartItemIndex].items[itemIndex].quantity;
      const cart_booking_id = cartItems[cartItemIndex].id

      if (currentQuantity + delta === 0) { // Delete cart item if quantity is 0
        cartItems[cartItemIndex].items.splice(itemIndex, 1);

      }

      if (cartItems[cartItemIndex].items.length === 0) { // Delete cart booking if no cart items
        cartItems.splice(cartItemIndex, 1);
      }

      setCartItems([...cartItems]);

    const newTimer = setTimeout(async () => {
      

      if (quantity >= 0 ){ // dbl check agn
        const response = await cartApi.put(`/updateCartItem/${user_type}/${tourist_email}/${cart_item_id}/${cart_booking_id}/${quantity}`)
          if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
              console.log('error',response.data)
          } else {
              console.log('success',response.data)
          }
      }
    }, 1000);

    setApiCallTimer(newTimer);
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
              // console.log(response.data)
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
            cartItems.map((cartItem, cartItemIndex) => (
              
              <ListItem.Swipeable
                  shouldCancelWhenOutside={false} 
                  rightWidth={90}
                  minSlideWidth={40}
                  key={cartItemIndex}
                  rightContent={
                      <Button
                        containerStyle={{
                          flex: 1,
                          justifyContent: "center",
                          backgroundColor: "#DC143C",
                        }}
                        type="clear"
                        icon={{ name: "delete-outline" }}
                        onPress={ () => { handleDeleteCartItem(cartItem.id);}}
                    />
                  }
                >

                <CheckBox left
                    iconType="material-community"
                    checkedIcon="checkbox-outline"
                    uncheckedIcon={'checkbox-blank-outline'}
                    containerStyle={{ marginLeft: -10, marginRight: -10, padding: 0 }}
                    checked={itemChecked[cartItemIndex]}
                    onPress={() => handleCheckBoxToggle(cartItemIndex)}
                />
      
                <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => { navigation.navigate('AttractionDetailsScreen', {attractionId: cartItem.attraction_id});}}>
                    <Image
                      source={{
                        uri: cartItem.image// KIV for image 
                      }} 
                      style={{ width: 75, height: 75, borderRadius: 10, marginLeft:5, marginRight: 0}} />
                </TouchableOpacity>
                    
                    
                <ListItem.Content style={{padding: 0, marginLeft: -10, height:80}}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "column" , width:180}}>
                      <ListItem.Title style={{ fontSize: 14, fontWeight: 'bold' }} >{cartItem.item_name}</ListItem.Title>
                      <ListItem.Subtitle style={{ fontSize: 12 , color: 'grey', fontWeight: 'bold'}} >Booking Date : {cartItem.startTime}</ListItem.Subtitle>
                      <ListItem.Subtitle style={{ fontSize: 12 , color: 'grey', fontWeight: 'bold'}}>S$ {cartItem.price}</ListItem.Subtitle>
                      {/* <ListItem.Subtitle>{cartItem.startTime} - {cartItem.endTime}</ListItem.Subtitle> */}
                      {/* <ListItem.Subtitle>{cartItem.quantity}</ListItem.Subtitle> */}
                    </View>
                    
                    <View style={{ flexDirection: "column" }}>
                    {
                      cartItem.items.map((item, itemIndex) => (
                      <View style={{ flexDirection: "row" }} key={itemIndex}>
                        <Text key={itemIndex} style={{marginLeft:8, marginBottom:10 , fontSize:13, fontWeight: 'bold'}}>{item.activity_selection} </Text> 
                          <TouchableOpacity 
                              style={{ backgroundColor: '#044537', height: 18, width: 18,justifyContent: 'center',alignItems: 'center',borderRadius: 9, marginLeft:5, marginBottom: 8 }} 
                              onPress={() => updateQuantity(cartItemIndex,itemIndex, -1)}
                          >
                          
                            <Text style={{color: 'white', fontSize: 15, fontWeight:'bold'}}> - </Text>
                          </TouchableOpacity>

                          <Text style={{ marginLeft: 5, marginTop: 2 ,fontSize:13}}>{item.quantity} </Text>

                          <TouchableOpacity style={{ backgroundColor: '#044537',  height: 18, width: 18 ,justifyContent: 'center',alignItems: 'center',borderRadius: 10 , marginLeft:5, marginBottom: 8}} 
                            onPress={() => updateQuantity(cartItemIndex,itemIndex, 1)}>
                          
                            <Text style={{color: 'white', fontSize: 15, fontWeight:'bold' }}> + </Text>

                          </TouchableOpacity>
                      </View>
                    ))} 
                  </View>
                </View>       
              </ListItem.Content>
            </ListItem.Swipeable>
          ))}

    </View>
  </ScrollView>


    
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(4, 69, 55, 0.2)', padding: 10 , height: 70 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CheckBox
          left
          iconType="material-community"
              checkedIcon="checkbox-outline"
              uncheckedIcon={'checkbox-blank-outline'}
          title="All"
          style={{ borderWidth: 0, margin: 0, padding: 0, fontWeight:'bold', color:'black'}}
          containerStyle={{ borderWidth: 0, margin: 0, padding: 0, backgroundColor: 'transparent', color:'black' }}
          checked={isAllChecked()} // Check if all items are checked
          onPress={handleCheckAllToggle}/>
            <Text style = {{fontWeight:'bold', color:'black'}}>Total Price: ${totalPrice.toFixed(2)}</Text>
      </View>

      <Button style={{borderRadius: 10, backgroundColor:'#044537'}} title="Checkout" onPress={() => { checkout();}} />
  </View>

</View>
  );
};
