import React, { useState } from 'react';
import { View,  Button, Modal,TextInput,  StyleSheet, TouchableOpacity, DatePickerAndroid } from 'react-native';
import {Text} from "@rneui/themed";
import { CardForm, useStripe } from '@stripe/stripe-react-native';
//import { deletePaymentMethod } from '../../redux/creditCard';
//import { Picker } from '@react-native-picker/picker';

export const CreditCardScreen = ({ route, navigation }) => {
  const { id, brand, last4, expMonth, expYear } = route.params;
  const [selectedMonth, setSelectedMonth] = React.useState(expMonth.toString());
  const [selectedYear, setSelectedYear] = React.useState(expYear.toString());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const [isEditMode, setEditMode] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => (currentYear + i).toString());

  const toggleEditMode = () => {
    setEditMode(!isEditMode);
  };

  const handleDeleteCard = async (payment_method_id) => {

    
      const tourist_email = "hardcoded@gmail.com"
      const result = await deletePaymentMethod(tourist_email, payment_method_id); 
      console.log(result.status)
      if (result.status) {
        console.log('checkmate')
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text>Credit Card/Debit Type: {brand}</Text>
      </View>
      <View style={styles.box}>
        <Text>Credit Card Details: **** **** ****{last4}</Text>
      </View>
      <View style={styles.box}>
      <Button title="Update Expiry Date"  />
        {isEditMode ? (
          <>
            <TouchableOpacity onPress={() => setShowMonthPicker(true)}>
          <Text>Expiration Month: {selectedMonth}</Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showMonthPicker}
        >
         {/*  <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <Picker.Item key={month} label={month.toString().padStart(2, '0')} value={month.toString()} />
            ))}
          </Picker> */}
          <Button title="Done" onPress={() => setShowMonthPicker(false)} />
        </Modal>
        <TouchableOpacity onPress={() => setShowYearPicker(true)}>
          <Text>Expiration Year: {selectedYear}</Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showYearPicker}
        >
         {/*  <Picker
            selectedValue={selectedYear}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            {years.map((year) => (
              <Picker.Item key={year} label={year} value={year} />
            ))}
          </Picker> */}
          <Button title="Done" onPress={() => setShowYearPicker(false)} />
        </Modal>
          </>
        ) : (
          <Text>
            Expiration: {selectedMonth}/{selectedYear}
          </Text>
        )}
      </View>
      <Button
        title={isEditMode ? "Save" : "Edit"}
        onPress={toggleEditMode}
      />
      <Button
        title="Delete"
        color="red"
        onPress={() => {
          handleDeleteCard(id)
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '80%',
    backgroundColor: '#f2f2f2',
    padding: 20,
    borderRadius: 10,
    margin: 10,
  },
});


