import React, { useEffect, useState } from 'react';
import Background from '../../components/Background';
import Header from '../../components/Header'
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { CardForm, useStripe } from '@stripe/stripe-react-native';

const CreditCardsScreen = ({ navigation }) => {
  const [cards, setCards] = useState([]); // Your state to keep track of user's cards
  const { confirmPayment, createPaymentMethod, listPaymentMethods } = useStripe();

  // Load saved cards
  /* useEffect(() => {
    const fetchSavedCards = async () => {
      // Replace this with an API call to your backend to get Stripe Customer ID
      const customerId = 'your-customer-id-here';
      
      // Fetch saved cards from Stripe
      const paymentMethods = await listPaymentMethods({
        customerId,
        type: 'card',
      });

      if (!paymentMethods.error) {
        setCards(paymentMethods.data);
      }
    };
    
    fetchSavedCards();
  }, []); */

  /* const handleAddCard = async () => {
    const { paymentMethod, error } = await createPaymentMethod({
      type: 'Card',
    });

    if (error) {
      // Handle error
      console.log(error);
    } else if (paymentMethod) {
      // Save new card (you may want to call your API to associate it with the user)
      setCards([...cards, paymentMethod]);
    }
  }; */



  /* return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Credit Cards</Text>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.card.brand} **** **** **** {item.card.last4}</Text>
            <Text>Exp: {item.card.exp_month}/{item.card.exp_year}</Text>
          </View>
        )}
      />
      <View style={styles.addButton}>
        <Button title="Add New Card" onPress={handleAddCard} />
      </View>
    </View>
  ); */

  return (
    <Background>
        <View >
        <Button
        title = "Add New Card"
        mode ="contained"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'AddCreditCardScreen' }],
          })
        }
      />
      </View>
    </Background>
    

  );
};

export default CreditCardsScreen;

/* const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  addButton: {
    marginTop: 20,
  },
}); */
