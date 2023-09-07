import React from 'react'
import Background from '../components/Background'
import Header from '../components/Header'
import Button from '../components/Button'
import { createStripeCustomer } from '../redux/creditCard'



const HomeScreen = ({ navigation }) => {

  const testStripeCustomer = () => {
    // Insert logic to test Stripe Customer here
    createStripeCustomer("checkmate4103@gmail.com","Checmkate")
    console.log("Testing Stripe Customer");
  }

  return (
    <Background>
      <Header>Home Screen</Header>
      <Button
        text = "Logout"
        mode ="contained"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'LoginScreen' }],
          })
        }
      />
      <Button
        text = "Test Card"
        mode ="contained"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'CreditCardsScreen' }],
          })
        }
      />
      <Button
        text="Test Stripe Customer"
        mode="contained"
        onPress={testStripeCustomer}
      />
    </Background>
  )
}
export default HomeScreen