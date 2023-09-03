import React, { useState, useEffect } from 'react';
import Background from '../../components/Background';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { useStripe } from '@stripe/stripe-react-native';

const CheckoutScreen = ({ navigation }) => {
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(async () => {
    await touristApi.post(`/create-payment-intent`)
      .then((response) => response.json())
      .then((data) => {
        setPaymentIntentClientSecret(data.clientSecret);
      });
  }, []);

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      paymentIntentClientSecret,
    });

    if (error) {
      console.error('Failed to initialize payment sheet:', error);
    }
  };

  const handlePaymentPress = async () => {
    if (!paymentIntentClientSecret) {
      console.error('PaymentIntent client secret is null');
      return;
    }

    const { error } = await presentPaymentSheet({ clientSecret: paymentIntentClientSecret });

    if (error) {
      console.error('Payment failed:', error);
    } else {
      console.log('Payment succeeded!');
    }
  };

  return (
    <Background>
      <Header>Stripe Checkout Example</Header>
      <Button
        text="Initialize Payment"
        mode="contained"
        onPress={initializePaymentSheet}
      />
      <Button
        text="Pay"
        mode="contained"
        onPress={handlePaymentPress}
      />
    </Background>
  );
};

export default CheckoutScreen;
