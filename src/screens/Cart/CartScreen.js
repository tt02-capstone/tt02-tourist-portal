import React , { useState, useEffect } from 'react';
import { View, FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ListItem, Button, CheckBox, Card, Avatar, Image, Text } from '@rneui/themed';
import { clearStorage, getUser, getUserType } from '../../helpers/LocalStorage';
import Toast from "react-native-toast-message";
import { cartApi } from '../../helpers/api';
import Background from '../../components/Background';


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

    };
  
    const formattedDate = new Date(date).toLocaleString(undefined, options);
    return formattedDate;
  }

  const checkout = async () => {
    if (cartItems.length >= 0) {
      const booking_ids = [];
    cartItems.forEach((cartItem) => {
        booking_ids.push(cartItem.id);
    })

    navigation.navigate('CheckoutScreen', { booking_ids, cartItems });


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
    

const styles = StyleSheet.create({
    list: {
      width: '100%',
      backgroundColor: '#000',
    },
    item: {
      aspectRatio: 1,
      width: '100%',
      flex: 1,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'lightgray', // Background color of the bottom bar
        paddingVertical: 10, // Adjust the padding as needed
      },
      button: {
        flex: 1,
        alignItems: 'center',
      },
      buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'blue', // Text color of the buttons
      },
    });

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
                console.log(detail.attraction.attraction_id)
                const { subtotal, selections, quantities } = getFields(detail.cart_item_list);
  
                return {
                    id: parseInt(detail.booking_id),
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
              
          }


      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    }

    onLoad();
  }, [deletion]);

  

  return (
    <View>

    
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
      containerStyle={{ marginLeft: -10, marginRight: -10, padding: 0 }}
      //checked={check2}
      //onPress={() => setCheck2(!check2)}
      
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
          cartItem.items.map((item) => (
            <Text>{item.activity_selection} Quantity: {item.quantity}</Text> 
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
      checkedIcon="dot-circle-o"
      uncheckedIcon="circle-o"
      title="All"
      style={{ borderWidth: 0, margin: 0, padding: 0 }}
      containerStyle={{ borderWidth: 0, margin: 0, padding: 0, backgroundColor: 'transparent' }}
      //checked={check2}
      //onPress={() => setCheck2(!check2)}
      
    />
        <Text>Total Price: $0.00</Text>
      </View>
      <Button title="Checkout" onPress={() => {
        checkout();
      }} />
    </View>

      </View>
  );
  
};
