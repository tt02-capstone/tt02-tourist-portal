import React, { useState, useEffect, } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { ListItem, CheckBox, Image, Text, Button } from '@rneui/themed';
import CustomButton from '../../components/CustomButton';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import Toast from "react-native-toast-message";
import { cartApi } from '../../helpers/api';
import { useIsFocused } from '@react-navigation/native';
import { retrieveAccommodationByRoom } from '../../redux/reduxAccommodation';

export const CartScreen = ({ navigation }) => {
  const [user, setUser] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [user_type, setUserType] = useState('');
  const [deletion, setDeletion] = useState(false);
  const [itemChecked, setItemChecked] = useState([false]); //Might not work since caritems have to be fetched first
  const [totalPrice, setTotalPrice] = useState(0);
  const [apiCallTimer, setApiCallTimer] = useState(null);
  const isFocused = useIsFocused();

  // if there is no item in cart, set total price to 0
  useEffect(() => {
    if (cartItems.length === 0) {
      setTotalPrice(0);
    }
  },[cartItems])

  function formatDateAndTime(date) {
    const options = {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    };

    const formattedDate = new Date(date).toLocaleString(undefined, options);
    return formattedDate;
  }

  function formatCheckInDateTime(accommodation, date) {
    const checkInTime = accommodation.check_in_time.split('T')[1];

    const checkInDate = new Date(date);
    checkInDate.setDate(checkInDate.getDate());
    const checkInDateInLocalDateTime = `${checkInDate.toLocaleString('en-US', { day: 'numeric', month: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' })}`;

    return checkInDateInLocalDateTime;
  }

  function formatCheckOutDateTime(accommodation, date) {
    const checkOutTime = accommodation.check_out_time.split('T')[1];

    const checkOutDate = new Date(date);
    checkOutDate.setDate(checkOutDate.getDate());

    const options = { day: 'numeric', month: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' };
    const checkOutDateInLocalDateTime = `${checkOutDate.toLocaleString('en-US', { day: 'numeric', month: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' })}`;

    return checkOutDateInLocalDateTime;
  }

  const checkout = async () => {
    const booking_ids = [];
    const selectedCartItems = [];
    itemChecked.forEach((isChecked, index) => {
      if (isChecked) {
        booking_ids.push(cartItems[index].id);
        selectedCartItems.push(cartItems[index]);
      }
    });

    if (selectedCartItems.length > 0) {
      navigation.navigate('CheckoutScreen', { booking_ids, selectedCartItems, totalPrice });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please select at least 1 item!'
      });
    }
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

  const handleDeleteCartItem = async (user, itemChecked) => {
    const tourist_email = user.email;
    const booking_ids = [];
    itemChecked.forEach((isChecked, index) => {
      if (isChecked) {
        booking_ids.push(cartItems[index].id);

      }
    });

    const response = await cartApi.put(`/deleteCartItems/${user_type}/${tourist_email}`, booking_ids)
    if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
      console.log('error', response.data)

    } else {
      // console.log('success', response.data)
      if (response.data) {
        setTotalPrice(0); // set it to 0 to ensure when the all checkbox is checked it return 0 when deleted 
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

  const updateQuantity = (cartItemIndex, itemIndex, delta) => {
    let tourPrice = 0

    if (cartItems[cartItemIndex].tour) { // ** FOR ATTRACTION if there is tour included in need to factor in the tour pricing changes
      tourPrice = parseFloat(cartItems[cartItemIndex].tour[0].price);
      let oldQ =  cartItems[cartItemIndex].tour[0].quantity 
      cartItems[cartItemIndex].tour[0].quantity = oldQ + delta; // update per pax for tours 
    }

    // Update the cart items with new quantity for the specified ticket type
    const currentQuantity = cartItems[cartItemIndex].items[itemIndex].quantity;

    if (currentQuantity + delta >= 0) { // quantity can never go  below 0
      cartItems[cartItemIndex].items[itemIndex].quantity += delta;

      // deal w the pricing change 
      const price = parseFloat(cartItems[cartItemIndex].items[itemIndex].price)
      const difference = price * delta; // get the change either +ve or - ve
      const tourDiff = tourPrice * delta
      const newTotalPrice = parseFloat(cartItems[cartItemIndex].price) + difference + parseFloat(tourDiff); // new total price for the list item 
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
      if (quantity >= 0) {
        const response = await cartApi.put(`/updateCartItem/${user_type}/${tourist_email}/${cart_item_id}/${cart_booking_id}/${quantity}`)
        if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
          console.log('error', response.data)
        } else {
          console.log('success', response.data)
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
        if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404 || response.data.httpStatusCode === 422) {
          console.log('error', response.data)

        } else {
          const cartDetails = response.data;
          console.log("cartDetails", cartDetails);
          const extractedDetails = await Promise.all(cartDetails.map(async (detail) => {
            const { subtotal, selections, quantities } = getFields(detail.cart_item_list);

            if (detail.type === 'ATTRACTION') {
              return {
                id: parseInt(detail.cart_booking_id),
                type: detail.type,
                attraction_id: detail.attraction.attraction_id,
                image: detail.attraction.attraction_image_list[0],
                item_name: detail.activity_name, // Needs to be conditional
                activity_name: detail.attraction.name, // Needs to be conditional
                startTime: formatDateAndTime(detail.start_datetime),
                endTime: formatDateAndTime(detail.end_datetime),
                items: detail.cart_item_list.filter(item => item.type === "ATTRACTION"), // get activity selection
                tour: detail.cart_item_list.filter(item => item.type === "TOUR").length != 0
                  ? detail.cart_item_list.filter(item => item.type === "TOUR") : null, // get tour selection
                price: subtotal.toFixed(2),
                quantity: quantities,
                selections: selections
              };
            } else if (detail.type === 'TELECOM') {
              return {
                id: parseInt(detail.cart_booking_id),
                type: detail.type,
                telecom_id: detail.telecom.telecom_id,
                image: detail.telecom.image,
                item_name: detail.activity_name,
                activity_name: detail.activity_name,
                startTime: formatDateAndTime(detail.start_datetime),
                endTime: formatDateAndTime(detail.end_datetime),
                items: detail.cart_item_list,
                price: subtotal.toFixed(2),
                quantity: quantities,
              };
            } else if (detail.type === 'ACCOMMODATION') {
              try {
                const accommodation = await retrieveAccommodationByRoom(detail.room.room_id);

                console.log("startTime HERE", detail.start_datetime);
                console.log("endTime HERE", detail.end_datetime);

                console.log("formatCheckInDateTime HERE", formatCheckInDateTime(accommodation, detail.start_datetime));
                console.log("formatCheckOutDateTime HERE", formatCheckOutDateTime(accommodation, detail.end_datetime));

                return {
                  id: parseInt(detail.cart_booking_id),
                  type: detail.type,
                  room_id: detail.room.room_id,
                  image: detail.room.room_image,
                  item_name: detail.activity_name,
                  activity_name: detail.activity_name,
                  startTime: formatCheckInDateTime(accommodation, detail.start_datetime),
                  endTime: formatCheckOutDateTime(accommodation, detail.end_datetime),
                  items: detail.cart_item_list,
                  price: subtotal.toFixed(2),
                  quantity: quantities,
                  accommodation: accommodation,
                };
              } catch (error) {
                console.error('Error fetching accommodation:', error);

                return {
                  error: 'Failed to fetch accommodation data',
                }
              }
            }
          }));

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
  }, [deletion, isFocused]);

  function formatAttractionTicket(text) {
    if (text === 'ALL') {
      return 'All';
    } else if (text === 'CHILD') {
      return 'Child';
    } else if (text === 'TEENAGER') {
      return 'Teenager';
    } else if (text === 'ADULT') {
      return 'Adult';
    } else if (text === 'SENIOR') {
      return 'Senior'
    } else {
      return text;
    }
  }

  function formatAccommodation(text) {
    if (text === 'STANDARD') {
      return 'Standard'
    } else if (text === 'DOUBLE') {
      return 'Double';
    } else if (text === 'SUITE') {
      return 'Suite';
    } else if (text === 'JUNIOR_SUITE') {
      return 'Junior Suite';
    } else if (text === 'DELUXE_SUITE') {
      return 'Deluxe Suite';
    } else {
      return text;
    }
  }

  return (
    <View>
      <ScrollView>
        <View>
          {cartItems.map((cartItem, cartItemIndex) => (
            <ListItem.Swipeable
              shouldCancelWhenOutside={false}
              rightWidth={90}
              minSlideWidth={40}
              key={cartItemIndex}
              rightContent={
                <Button
                  containerStyle={{ flex: 1, justifyContent: "center", backgroundColor: "#DC143C" }}
                  type="clear"
                  icon={{ name: "delete-outline" }}
                  onPress={() => { handleDeleteCartItem(cartItem.id); }}
                />
              }
            >

              <CheckBox left
                iconType="material-community"
                checkedIcon="checkbox-outline"
                uncheckedIcon={'checkbox-blank-outline'}
                containerStyle={{ marginLeft: -5, marginRight: -10, padding: 0 }}
                checked={itemChecked[cartItemIndex]}
                onPress={() => handleCheckBoxToggle(cartItemIndex)}
              />

              {/* attraction */}
              {cartItem.type === 'ATTRACTION' &&
                <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => { navigation.navigate('AttractionDetailsScreen', { attractionId: cartItem.accommodation.accommodation_id }); }}>
                  <Image
                    source={{ uri: cartItem.image }}
                    style={{ width: 60, height: 60, borderRadius: 10, marginLeft: 5, marginRight: 0 }} />
                </TouchableOpacity>
              }

              {/* Telecom */}
              {cartItem.type === 'TELECOM' &&
                <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => { navigation.navigate('TelecomDetailsScreen', { id: cartItem.telecom_id }); }}>
                  <Image
                    source={{
                      uri: cartItem.image
                    }}
                    style={{ width: 60, height: 60, borderRadius: 10, marginLeft: 5, marginRight: 0 }} />
                </TouchableOpacity>
              }

              {/* Accommodation */}
              {cartItem.type === 'ACCOMMODATION' &&
                <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => { navigation.navigate('AccommodationDetailsScreen', { id: cartItem.accommodation_id }); }}>
                  <Image
                    source={{
                      uri: cartItem.image
                    }}
                    style={{ width: 60, height: 60, borderRadius: 10, marginLeft: 5, marginRight: 0 }} />
                </TouchableOpacity>
              }

              {/* Common */}
              <ListItem.Content style={{ padding: 0, marginLeft: -10, height: 80,}}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "column", width: 140 }}>
                    <ListItem.Title style={{ fontSize: 12, fontWeight: 'bold' }} >{cartItem.item_name}</ListItem.Title>

                    {cartItem.type === 'ATTRACTION' &&
                      <ListItem.Subtitle style={{ fontSize: 10, color: 'grey', fontWeight: 'bold' }} >Date: {cartItem.startTime}</ListItem.Subtitle>
                    }
                    {cartItem.type === 'TELECOM' &&
                      <ListItem.Subtitle style={{ fontSize: 10, color: 'grey', fontWeight: 'bold' }} >Date: {cartItem.startTime}</ListItem.Subtitle>
                    }
                    {cartItem.type === 'ACCOMMODATION' && (
                      <>
                        <ListItem.Subtitle style={{ fontSize: 10, color: 'grey', fontWeight: 'bold' }}>
                          Start: {cartItem.startTime}
                        </ListItem.Subtitle>
                        <ListItem.Subtitle style={{ fontSize: 10, color: 'grey', fontWeight: 'bold' }}>
                          End: {cartItem.endTime}
                        </ListItem.Subtitle>
                      </>
                    )}

                    <ListItem.Subtitle style={{ fontSize: 10, color: 'grey', fontWeight: 'bold' }}>S$ {cartItem.price}</ListItem.Subtitle>
                    {cartItem.type === 'ATTRACTION' && cartItem.tour != null ?
                      <ListItem.Subtitle style={{ fontSize: 10, color: 'red', fontWeight: 'bold' }}>
                        Add Ons : {cartItem.tour[0].activity_selection}
                      </ListItem.Subtitle> : <Text></Text>}
                    {/* <ListItem.Subtitle>{cartItem.startTime} - {cartItem.endTime}</ListItem.Subtitle> */}
                    {/* <ListItem.Subtitle>{cartItem.quantity}</ListItem.Subtitle> */}
                  </View>

                  <View style={{ flexDirection: "column" }}>
                    {cartItem.items.map((item, itemIndex) => (
                      <View style={{ flexDirection: "row"}} key={itemIndex}>

                        {cartItem.type === 'ATTRACTION' &&
                          <Text 
                            key={itemIndex} style={{ minWidth: 50, margin: 5, fontSize: 10, fontWeight: 'bold' }}>{formatAttractionTicket(item.activity_selection)} </Text>
                        }

                        {cartItem.type === 'ACCOMMODATION' &&
                          <Text 
                            key={itemIndex} style={{ minWidth: 50, margin: 5, fontSize: 10, fontWeight: 'bold' }}>{formatAccommodation(item.activity_selection)} </Text>
                        }

                        {(cartItem.type === 'ATTRACTION' || cartItem.type === 'TELECOM') && (
                          <TouchableOpacity
                            style={{
                              backgroundColor: '#044537', height: 20, width: 20, justifyContent: 'center', alignItems: 'center',
                              borderRadius: 15, marginLeft: 0, marginBottom: 8
                            }}
                            onPress={() => updateQuantity(cartItemIndex, itemIndex, -1)}
                          >
                            {cartItem.type === 'TELECOM' && <View></View>}
                            <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}> - </Text>
                          </TouchableOpacity>
                        )}

                        <Text style={{ marginLeft: 10, marginRight: 10, marginTop: 2, fontSize: 15 }}>{item.quantity}</Text>

                        {(cartItem.type === 'ATTRACTION' || cartItem.type === 'TELECOM') && (
                          <TouchableOpacity
                            style={{
                              backgroundColor: '#044537', height: 20, width: 20, justifyContent: 'center', alignItems: 'center',
                              borderRadius: 15, marginLeft: 0, marginBottom: 8
                            }}
                            onPress={() => updateQuantity(cartItemIndex, itemIndex, 1)}
                          >
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}> + </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              </ListItem.Content>
            </ListItem.Swipeable>
          ))}
        </View>
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#99e699', padding: 10, height: 70 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CheckBox
            left
            iconType="material-community"
            checkedIcon="checkbox-outline"
            uncheckedIcon={'checkbox-blank-outline'}
            title="All"
            style={{ borderWidth: 0, margin: 0, padding: 0, fontWeight: 'bold', color: 'black' }}
            containerStyle={{ borderWidth: 0, margin: 0, padding: 0, backgroundColor: 'transparent', color: 'black' }}
            checked={isAllChecked()} // Check if all items are checked
            onPress={handleCheckAllToggle} />
          <Text style={{ fontWeight: 'bold', color: 'black' }}>Total Price: ${totalPrice.toFixed(2)}</Text>
        </View>

        {/* <Button title="Checkout" onPress={() => {checkout()}} /> */}
        <Button color='#044537' style={{ borderRadius: '10' }} onPress={() => {checkout()}} >Checkout</Button>
      </View>
    </View>
  );
};