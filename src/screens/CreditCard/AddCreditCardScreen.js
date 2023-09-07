import React,{useState} from "react";
import { CardForm, useStripe } from '@stripe/stripe-react-native';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import Background from '../../components/Background'
import Header from '../../components/Header'

const AddCardScreen = ({ navigation }) => {
  const { confirmPayment, createPaymentMethod } = useStripe();
  const [cardDetails, setCardDetails] = useState(null);

  const handleSaveCard = async () => {
    const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
      })
    if (error) {
      console.log(error)
      // To use some snackbar to show error message 
    } else if (paymentMethod) {
      // API call to associate paymentMethod.id with customer on your server
      console.log(paymentMethod.id)
    }
  };

  return (

      
    <View style={{flex:1}}>
    <Header>Card Details</Header>
    <CardForm
      placeholder={{
        number: "4242 4242 4242 4242",
      }}
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
        mode ="contained"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'CreditCardsScreen' }],
          })
        }
      />
</View>

    

    
  );
}

export default AddCardScreen

/* const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  cardFormContainer: {
    height: 300, // Adjust the height as needed
    marginBottom: 20,
  },
}); */
