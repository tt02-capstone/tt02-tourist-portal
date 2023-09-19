import React,{useEffect, useState} from "react";
import { CardForm, useStripe } from '@stripe/stripe-react-native';
import { View,  FlatList, StyleSheet } from 'react-native';
import Toast from "react-native-toast-message";
import { Text, Card, Button, Icon, ListItem } from '@rneui/themed';
import {getEmail, getUserType, getUser} from "../../helpers/LocalStorage";
import { useRoute } from '@react-navigation/native';
import {paymentsApi} from "../../helpers/api";



export const AddCreditCardScreen = ({ navigation }) => {
  const [tourist_email, setTouristEmail] = useState('');
  const [user_type, setUserType] = useState('');
  const { confirmPayment, createPaymentMethod } = useStripe();
  const [cardDetails, setCardDetails] = useState(null);
  const route = useRoute();
  const { previousScreen, booking_ids, selectedCartItems, totalPrice } = route.params;

  useEffect(() => {
    
    
    
    async function onLoad() {
      try {
        const userData = await getUser();
        setTouristEmail(userData.email);
        setUserType(await getUserType());        
        
      } catch (error) {
        console.error("Error with loading email and user type:", error);
      }
    }
    
    onLoad();
  }, []);

  

  const handleSaveCard = async () => {
    const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
      })
    if (error) {
      console.log(error) // To use Toast
    } else if (paymentMethod) {
      const payment_method_id = paymentMethod.id;
      const response = await paymentsApi.post(`/addPaymentMethod/${user_type}/${tourist_email}/${payment_method_id}`)
      console.log(response.data.httpStatusCode)
      if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
          console.log('error',response.data)

      } else {
          console.log('success', response.data)
          if (response.data) {
            Toast.show({
              type: 'success',
              text1: 'Successfully added card'
          });
          navigation.goBack();
          /* if (previousScreen === "CheckoutScreen") {
            navigation.navigate(
             'CheckoutScreen', {
              booking_ids: booking_ids,
              selectedCartItems: selectedCartItems,
              totalPrice: totalPrice,
              addedCard: response.data,
              payment_method_id: payment_method_id
             } 
            )
          } else if (previousScreen === "CreditCardsScreen") {
            navigation.reset(
              'CreditCardsScreen' 
             )
          }  */
        } else {
            Toast.show({
              type: 'error',
              text1: 'Unable to add card'
          });
          }
          
              
      };
 

    
      }
    
    


    }
  


  return (

      
    <View style={{flex:1}}>
   
    <Card>
    <Card.Title >
        Card Details       
    </Card.Title>
    
    <CardForm

      onFormComplete={(cardDetails) => {
        console.log("card details", cardDetails)
        setCardDetails(cardDetails)
      }}
      style={{
        height: 200,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
      cardStyle={{
        backgroundColor: "#efefefef",
        textAlign: "center",
        textColor: "pink",
      }}
    />
    <Button title="Save Card" onPress={handleSaveCard} />
    <Button
        title = "Cancel"
        style={{ marginTop: 10 }}
        type="outline"
        mode ="contained"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'CreditCardsScreen' }],
          })
        }
      />
      </Card>
</View>

    

    
  );
};

