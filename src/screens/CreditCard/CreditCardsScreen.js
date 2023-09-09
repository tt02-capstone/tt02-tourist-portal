import React, { useEffect, useState } from 'react';
import Background from '../../components/Background';
import Header from '../../components/Header'
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { CardForm, useStripe } from '@stripe/stripe-react-native';
import { getPaymentMethods } from '../../redux/creditCard'

const CreditCardsScreen = ({ navigation }) => {
  const [cards, setCards] = useState([]); // Your state to keep track of user's cards
  

  useEffect(() => {
    async function onLoad(tourist_email) {
      try {
        const paymentMethods = await getPaymentMethods(tourist_email);  
        
        console.log(paymentMethods)
        const extractedDetails = paymentMethods.map(paymentMethod => {
          const { card } = paymentMethod;
          return {
            id: paymentMethod.id,
            last4: card.last4,
            brand: card.brand,
            expMonth: card.expMonth,
            expYear: card.expYear,
            
          };
        });
        setCards(extractedDetails)
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    }
    const tourist_email = "asd@gmail.com"; //get from local storage
    onLoad(tourist_email);
  }, []);
  

  /* const tempCards = [
    { id: 'card_1abc', last4: '1234', brand: 'Visa' },
    { id: 'card_2def', last4: '5678', brand: 'MasterCard' },
    // ...
  ];

  setCards(tempCards) */
  
  return (
    <Background>
        <View >
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <Text style={styles.cardText}>
                {`${item.brand} **** **** **** ${item.last4}`}
              </Text>
            </View>
          )}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'AddCreditCardScreen' }],
            })
          }
        >
          <Text style={styles.addButtonText}>Add New Card</Text>
        </TouchableOpacity>
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

export default CreditCardsScreen;


