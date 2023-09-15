import React, { useEffect, useState } from 'react';
import Background from '../../components/Background';
import Header from '../../components/Header'
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { CardForm, useStripe } from '@stripe/stripe-react-native';
import { getPaymentMethods } from '../../redux/creditCard'
import {getEmail, getUserType} from "../../helpers/LocalStorage";
import {paymentsApi} from "../../helpers/api";
import { Text, Card, Icon, Button, ListItem } from '@rneui/themed';
import Toast from "react-native-toast-message";


export const CreditCardsScreen = ({ navigation }) => {
  const [cards, setCards] = useState([]); 
  const [tourist_email, setTouristEmail] = useState('');
  const [user_type, setUserType] = useState('');


  useEffect(() => {
    
    
    
    async function onLoad() {
      try {
        const tourist_email = await getEmail();
        const user_type = await getUserType();
        setTouristEmail(await getEmail());
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
  }, []);
  
  const cardHeight = 150 + cards.length * 50;

  const handleDeleteCard = async (payment_method_id) => {

  
    const response = await paymentsApi.put(`/deletePaymentMethod/${user_type}/${tourist_email}/${payment_method_id}`)
    if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
      console.log('error',response.data)
      //return JSON.parse(response.data);

  } else {
    console.log('success', response.data)
    if (response.data) {
      Toast.show({
        type: 'success',
        text1: 'Successfully deleted card'
    });
      navigation.navigate('CreditCardsScreen');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Unable to delete card'
    });
    }
  }
    
};
  
  return (
    <Background>
        <View >
        <Card containerStyle={{ height: cardHeight, marginTop: 0 ,alignSelf: 'flex-start'}}>
        <Card.Title >
          <Text style={{ fontSize: 20 }}>My Credit Cards</Text>
        </Card.Title>
        {
          cards.map((card) => (
            
            <ListItem.Swipeable
  leftWidth={80}
  rightWidth={90}
  minSlideWidth={40}
  shouldCancelWhenOutside={false} 
  leftContent={(action) => (
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
  )}
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

  <Icon name={`${card.brand.toLowerCase()}`} type="fontisto" />
  <ListItem.Content>
  <TouchableOpacity
              onPress={() => {
                navigation.navigate('CreditCardScreen', {
                  id: card.id,
                  brand: card.brand,
                  last4: card.last4,
                  expMonth: card.expMonth,
                  expYear: card.expYear,
                });
              }}
            >
    <ListItem.Title>**** **** **** {card.last4}</ListItem.Title>
    <ListItem.Subtitle>Expires {card.expMonth.toString().padStart(2, '0')}/{card.expYear} </ListItem.Subtitle>
    </TouchableOpacity>
  </ListItem.Content>
  
  <ListItem.Chevron />
</ListItem.Swipeable>

        ))}
       
        <TouchableOpacity
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'AddCreditCardScreen' }],
            })
          }
        >
          <View style={{ width: 400, height: 150 }}>
        <Card>
          <Text>+ Add a Credit/ Debit Card</Text>
        </Card>
       

      </View>
        </TouchableOpacity>
        

        </Card>
      </View>
    </Background>
    

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




