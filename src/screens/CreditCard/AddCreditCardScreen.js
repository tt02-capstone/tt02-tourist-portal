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
      Toast.show({
        type: 'error',
        text1: error.message
    });
    } else if (paymentMethod) {
      try {

        const payment_method_id = paymentMethod.id;
      const response = await paymentsApi.post(`/addPaymentMethod/${user_type}/${tourist_email}/${payment_method_id}`)
      console.log(response.data.httpStatusCode)
      console.log(response)
      if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404 || response.data.httpStatusCode === 422) {
        Toast.show({
          type: 'error',
          text1: response.data.errorMessage
      });

      } else {
          console.log('success', response.data)
          if (response.data) {
            Toast.show({
              type: 'success',
              text1: 'Successfully added card'
          });
          navigation.goBack();

        } else {
            Toast.show({
              type: 'error',
              text1: 'Unable to add card'
          });
          }
          
              
      };

      } catch (error) {

        Toast.show({
          type: 'error',
          text1: error.message
      });

      }
      
 

    
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

