import React , { useState, useEffect } from 'react';
import { View, FlatList, ScrollView, TouchableOpacity} from 'react-native';
import { ListItem, CheckBox, Card, Avatar, Image, Text, Icon } from '@rneui/themed';
import { ActivityIndicator } from 'react-native-paper';
import Button from '../../components/Button';
import { clearStorage, getUser, getUserType, getEmail } from '../../helpers/LocalStorage';
import Toast from "react-native-toast-message";
import { cartApi, paymentsApi } from '../../helpers/api';
import { useRoute } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';

export const CheckoutScreen = ({navigation}) => {
    
  const route = useRoute();
  const [user, setUser] = useState('');
  const [cartItems, setCartItems] = useState([]); 
  const [user_type, setUserType] = useState('');
  const [deletion, setDeletion] = useState(false);
  const [cards, setCards] = useState([]); 
  const [itemChecked, setItemChecked] = useState([false]); 
  const [isCheckout, setIsCheckout] = useState(false);
  const { booking_ids, priceList, selectedCartItems, totalPrice} = route.params;
  const isFocused = useIsFocused();

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

  const getSelectedCard = itemChecked.map((isChecked, index) => {
    if (isChecked) {
      return index;
    }
    return -1; // Use a sentinel value for false items
  }).filter(index => index !== -1);

  const checkout = async () => {
    if (getSelectedCard.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Please select a card!'
      });
      return;
    }
    
    const tourist_email = user.email;
    const user_type = await getUserType();
    const payment_method_id = cards[getSelectedCard].id;
    // console.log(booking_ids)

    try {
      let tempObj = {
        booking_ids: booking_ids,
        priceList: priceList,
      }
      setIsCheckout(true);
      
      const response = await cartApi.post(`/checkout/${user_type}/${tourist_email}/${payment_method_id}/${totalPrice}`, tempObj);
      if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
        console.log('error',response.data)
        setIsCheckout(false);

  } else {
      console.log('success', response.data)
      if (response.data) {
        setIsCheckout(false);
        navigation.reset({
          index: 2,
          routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'BookingHistoryScreen' }],
        })

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

    } catch {
      setIsCheckout(false);
      Toast.show({
        type: 'error',
        text1: 'Error creating a booking'
      });
    }
  }

  const handleCheckBoxToggle = (index) => {
    const updatedChecked = itemChecked.map((isChecked, i) => i === index);
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

        // console.log(tourist_email)
        // console.log(user_type)
        const response = await paymentsApi.get(`/getPaymentMethods/${user_type}/${tourist_email}`)
          if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404 || response.data.httpStatusCode === 422) {
              console.log('error',response.data)
              //return JSON.parse(response.data);
  
          } else {
              const paymentMethods = response.data;
              // console.log(paymentMethods)
              const extractedDetails = paymentMethods.map(paymentMethod => {
                const { card } = paymentMethod;
                // console.log(card)
                return {
                  id: paymentMethod.id,
                  last4: card.last4,
                  brand: card.brand,
                  expMonth: card.expMonth,
                  expYear: card.expYear,
                  
                };
              });
              setCards(extractedDetails)
              setItemChecked(Array(extractedDetails.length).fill(false))
          }
        
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    }

    onLoad();
  }, [isFocused]);

  return (
    <View>
      <ScrollView>
        <View>
          {
          selectedCartItems.map((cartItem, index) => (
            <ListItem.Swipeable
              shouldCancelWhenOutside={false} 
              rightWidth={90}
              minSlideWidth={40}
              key={cartItem.id}
            >

            {/* <TouchableOpacity style={{ flexDirection: "row" }}
              onPress={() => {
                navigation.navigate('AttractionDetailsScreen', {
                    attractionId: cartItem.attraction_id,
                });
              }}
            > */}
            
            <Image
              source={{ uri: cartItem.image }}
              style={{ width: 75, height: 75, borderRadius: 10, marginLeft: 0, marginRight: 0}}
            />
            <ListItem.Content style={{padding: 0, margin: 0}}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "column", }}>
              <ListItem.Title style={{fontSize: 16}}>{cartItem.item_name}</ListItem.Title>
              <ListItem.Subtitle style={{fontSize: 14}}>{cartItem.startTime} - {cartItem.endTime}</ListItem.Subtitle>
              <View style={{ flexDirection: "column" }}>
              {
              cartItem.items.map((item, index) => (
                <Text key={index} style={{fontSize: 13}} >{item.activity_selection.replace(/_/g, ' ')} Qty: {item.quantity}</Text> 
              ))
              }

              </View>
              <ListItem.Subtitle style={{fontSize: 14}}>${priceList[index]}</ListItem.Subtitle>
            </View>
          </View>       
          </ListItem.Content>
          {/* </TouchableOpacity> */}    
          </ListItem.Swipeable>
        ))}
        <ListItem containerStyle={padding= 20}>
      
      <View>
        <Text> Select Payment Method</Text>

        <View style={{ flexDirection: "column"}}>
        {
          cards.map((card, index) => (
          <ListItem
            leftWidth={80}
            rightWidth={90}
            minSlideWidth={40}
            shouldCancelWhenOutside={false} 
            key={index}
          >
            <CheckBox
              left
              iconType="material-community"
              checkedIcon="radiobox-marked"
              uncheckedIcon="radiobox-blank"
              containerStyle={{ marginLeft: -10, marginRight: -10, padding: 0 }}
              checked={itemChecked[index]}
              onPress={() => handleCheckBoxToggle(index)}
            />
              <Icon name={`${card.brand.toLowerCase()}`} type="fontisto" />
            <ListItem.Content>
              {/* <TouchableOpacity
                      onPress={() => {
                      navigation.navigate('CreditCardScreen', {
                        id: card.id,
                        brand: card.brand,
                        last4: card.last4,
                        expMonth: card.expMonth,
                        expYear: card.expYear,
                      });
                    }}
                  > */}
                  <ListItem.Title>**** **** **** {card.last4}</ListItem.Title>
                <ListItem.Subtitle>Expires {card.expMonth.toString().padStart(2, '0')}/{card.expYear} </ListItem.Subtitle>
                {/* </TouchableOpacity> */}
              </ListItem.Content>
            </ListItem >
              ))}
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Button 
                  text="+ Add a Credit/ Debit Card" 
                  // type="outline"
                  style={{width: 300}} 
                  onPress={() => navigation.navigate('AddCreditCardScreen', {
                    previousScreen: 'CheckoutScreen',
                    booking_ids: booking_ids,
                    selectedCartItems: selectedCartItems,
                    totalPrice: totalPrice,
                  })}
                />
              </View>
            </View>
          </View>
        </ListItem>
      </View>
    </ScrollView>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'lightgreen', padding: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>Total Price: ${totalPrice.toFixed(2)}</Text>
      </View>
        <View style={{marginRight: -90}}>
          <ActivityIndicator size='small' animating={isCheckout} color='green'/>
        </View>
        <Button text="Book Now" style={{width: 100}} onPress={() => {checkout()}} />
      </View>
    </View>
  );
};
