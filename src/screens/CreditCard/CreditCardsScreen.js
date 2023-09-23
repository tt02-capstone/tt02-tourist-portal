import React, { useEffect, useState } from 'react';
import Background from '../../components/Background';
import Header from '../../components/Header'
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CardForm, useStripe } from '@stripe/stripe-react-native';
//import { getPaymentMethods } from '../../redux/creditCard'
import {getEmail, getUserType, getUser} from "../../helpers/LocalStorage";
import {paymentsApi} from "../../helpers/api";
import { Text, Card, Icon, Button, ListItem } from '@rneui/themed';
import Toast from "react-native-toast-message";
import { useIsFocused } from '@react-navigation/native';



export const CreditCardsScreen = ({ navigation }) => {
  const [cards, setCards] = useState([]); 
  const [tourist_email, setTouristEmail] = useState('');
  const [user_type, setUserType] = useState('');
  const [deletion, setDeletion] = useState(null);
  const [addition, setAddition] = useState(null);
  const isFocused = useIsFocused();


  useEffect(() => {
    
    
    
    async function onLoad() {
      try {
        const userData = await getUser();
        const tourist_email = userData.email;
        setTouristEmail(userData.email);

        console.log(tourist_email)
        const user_type = await getUserType();
        console.log(user_type)

        setUserType(await getUserType()); 
        const response = await paymentsApi.get(`/getPaymentMethods/${user_type}/${tourist_email}`)
          if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
              console.log('error',response.data)
              //return JSON.parse(response.data);
  
          } else {
              const paymentMethods = response.data;
              console.log(paymentMethods)
              const extractedDetails = paymentMethods.map(paymentMethod => {
                const { card } = paymentMethod;
                console.log(card)
                return {
                  id: paymentMethod.id,
                  last4: card.last4,
                  brand: card.brand,
                  expMonth: card.expMonth,
                  expYear: card.expYear,
                  
                };
              });
              setCards(extractedDetails)
        
          }
        
        
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    }
    
    onLoad();
  }, [deletion, isFocused]);
  
  const cardHeight =  cards.length * 80;

  const handleDeleteCard = async (payment_method_id) => {

  
    const response = await paymentsApi.put(`/deletePaymentMethod/${user_type}/${tourist_email}/${payment_method_id}`)
    if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
      console.log('error',response.data)
      //return JSON.parse(response.data);

  } else {
    console.log('success', response.data)
    
    if (response.data) {
      setDeletion(true);
      console.log(deletion)
      Toast.show({
        type: 'success',
        text1: 'Successfully deleted card'
    });
      
    } else {
      Toast.show({
        type: 'error',
        text1: 'Unable to delete card'
    });
    }
  }
    
};
  
  return (

         <ScrollView>
  
        {/* <Card containerStyle={{ height: cardHeight, marginTop: 0 ,marginBottom: 0, alignSelf: 'center'}}> */}
        {/* <Card.Title >
          <Text style={{ fontSize: 20 }}>Credit Card Details</Text>
        </Card.Title> */}
        {
          cards.map((card, index) => (
            
            <ListItem.Swipeable
  leftWidth={80}
  rightWidth={90}
  minSlideWidth={40}
  shouldCancelWhenOutside={false} 
  key={index}
  rightContent={(action) => (
    <Button
      containerStyle={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#DC143C",
      }}
      type="clear"
      icon={{ name: "delete-outline" }}
      onPress={() => {
        handleDeleteCard(card.id);
        action();
      }}
    />
  )}


>

{/* onPress={() => {
    navigation.navigate('CreditCardScreen', {
      id: card.id,
      brand: card.brand,
      last4: card.last4,
      expMonth: card.expMonth,
      expYear: card.expYear,
    });
  }} */}

{/* leftContent={(action) => (
    <Button
      containerStyle={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#f4f4f4",
      }}
      type="clear"
      icon={{
        name: "credit-card-edit-outline",
        type: "material-community",
      }}
      onPress={action}
    />
  )} */}
  <Icon name={`${card.brand.toLowerCase()}`} type="fontisto" />
  <ListItem.Content>
  
    <ListItem.Title>**** **** **** {card.last4}</ListItem.Title>
    <ListItem.Subtitle>Expires {card.expMonth.toString().padStart(2, '0')}/{card.expYear} </ListItem.Subtitle>
    
  </ListItem.Content>
  <ListItem.Chevron />
</ListItem.Swipeable>

        ))}


       
      
          <View style={{ width: 400, height: 150 }}>
          <Button title="+ Add a Credit/ Debit Card" onPress={() => navigation.navigate('AddCreditCardScreen', {
              previousScreen: 'CreditCardsScreen',
            })} />
       

      </View>

        

       {/*  </Card> */}
      </ScrollView>

    

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    color: '#D3D3D3',
    borderColor: '#D3D3D3',  // You can use any color
    borderWidth: 1,       // You can adjust the border width
    borderRadius: 8,      // Rounded corners
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 1,   
  },
  cardText: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
});




