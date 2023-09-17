import React , { useState, useEffect } from 'react'
import Background from '../components/CardBackground'
import Header from '../components/Header'
import Button from '../components/Button'
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import AttractionImg from '../image/attractions.jpg'
import RestaurantImg from '../image/restaurant.jpg'
import AccomsImg from '../image/accoms.jpg'
import TeleImg from '../image/telecom.png'
import DealImg from '../image/discount.png'
import { clearStorage, getUser, getUserType } from '../helpers/LocalStorage';

export const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    const userData = await getUser()
    setUser(userData)

    const usertype =  await getUserType()
  }

  const viewAttractions = () => {
    navigation.navigate('AttractionScreen')
  }

  return (
    <Background>
      <ScrollView>
      <View style={styles.container}>
        <Card>
            <Card.Title style={styles.header}>Attractions</Card.Title>
            <Card.Image
              style={{ padding: 0}}
              source={{
                uri: AttractionImg
              }}
            />
            <Text style={styles.description}>
            Embark on an exciting journey in Singapore and explore a diverse array of attractions that cater to every interest
            from iconic landmarks to hidden gems!
            </Text>
            <Button text = "VIEW MORE" mode="contained" onPress={viewAttractions}/>
          </Card>
          
          <Card>
            <Card.Title>Accomodation</Card.Title>
            <Card.Image
              style={{ padding: 0 }}
              source={{
                uri: AccomsImg
              }}
            />
            <Text style={styles.description}>
              Discover a wide range of accommodation options in Singapore, tailored to suit every traveler's preferences.
              Start exploring your options now!
            </Text>
            <Button text = "VIEW MORE" mode="contained" onPress={viewAttractions}/>
          </Card>

          <Card>
            <Card.Title>Restaurant</Card.Title>
            <Card.Image
              style={{ padding: 0 }}
              source={{
                uri: RestaurantImg
              }}
            />
            <Text style={styles.description}>
              Indulge your taste buds in Singapore's vibrant culinary scene, where a myriad of restaurants await to 
              delight your palate. Come and savor the extraordinary culinary delights that await you!
            </Text>
            <Button text = "VIEW MORE" mode="contained" onPress={viewAttractions}/>
          </Card>

          <Card>
            <Card.Title>Telecom Packages</Card.Title>
            <Card.Image
              style={{ padding: 0 }}
              source={{
                uri: TeleImg
              }}
            />
            <Text style={styles.description}>
              Stay connected during your Singapore adventure with tailored telecom packages designed especially for tourists. 
              Choose from a variety of cost-effective plans and make the most of your visit with our telecom packages!
            </Text>
            <Button text = "VIEW MORE" mode="contained" onPress={viewAttractions}/>
          </Card>

          <Card>
            <Card.Title>Deals and Discount</Card.Title>
            <Card.Image
              style={{ padding: 10 }}
              source={{
                uri: DealImg
              }}
            />
            <Text style={styles.description}>
              Unlock unbeatable deals and discounts that add extra value to your Singapore journey. Don't miss out 
              on the chance to save while indulging in the best Singapore can offer!
            </Text>
            <Button text = "VIEW MORE" mode="contained" onPress={viewAttractions}/>
          </Card>
          <Button
        text = "Manage Payments"
        mode ="contained"
        onPress={() =>
          navigation.navigate('CreditCardsScreen')
        }
      />
        </View>
      </ScrollView>  
    </Background>
  ) 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize : 15
  },
  fonts: {
    marginBottom: 8,
  },
  user: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  image: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    marginTop: 5,
  },
  description: {
    marginBottom: 10, fontSize: 13, marginTop : 10 
  }
});
