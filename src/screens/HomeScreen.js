import React, {useContext, useEffect, useState} from 'react'
import Background from '../components/CardBackground'
import Button from '../components/Button'
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { clearStorage, getUser, getUserType } from '../helpers/LocalStorage';
import {Paragraph} from "react-native-paper";
import {localApi, loggedUserApi, touristApi, updateApiInstances} from "../helpers/api";
import {AuthContext} from "../helpers/AuthContext";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

export const HomeScreen = ({navigation}) => {
    const [userData, setUserData] = useState('')
    const authContext= useContext(AuthContext);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
      updateApiInstances(authContext.getAccessToken())
      const userData = await getUser()
      setUserData(userData)
      const usertype =  await getUserType()
      console.log(authContext.getAccessToken())
  }

  const viewAttractions = () => {
    navigation.navigate('AttractionScreen')
  }

  const onLogoutPressed = async () => {
        await clearStorage();
        await authContext.logout();
        navigation.reset({
            index: 0,
            routes: [{name: 'LoginScreen'}],
        })
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
                  uri: 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/attractions.jpg'
                }}
              />
              <Text style={styles.description}>
              Embark on an exciting journey in Singapore and explore a diverse array of attractions that cater to every interest
              from iconic landmarks to hidden gems!
              </Text>
              <Button style={styles.button} text = "VIEW MORE" mode="contained" onPress={viewAttractions}/>
            </Card>

            <Card>
              <Card.Title>Accomodation</Card.Title>
              <Card.Image
                style={{ padding: 0 }}
                source={{
                  uri: 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/accoms.jpg'
                }}
              />
              <Text style={styles.description}>
                Discover a wide range of accommodation options in Singapore, tailored to suit every traveler's preferences.
                Start exploring your options now!
              </Text>
              <Button style={styles.button} text = "VIEW MORE" mode="contained" onPress={viewAttractions}/>
            </Card>

            <Card>
              <Card.Title>Restaurant</Card.Title>
              <Card.Image
                style={{ padding: 0 }}
                source={{
                  uri: 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/restaurant.jpg'
                }}
              />
              <Text style={styles.description}>
                Indulge your taste buds in Singapore's vibrant culinary scene, where a myriad of restaurants await to
                delight your palate. Come and savor the extraordinary culinary delights that await you!
              </Text>
              <Button style={styles.button} text = "VIEW MORE" mode="contained" onPress={viewAttractions}/>
            </Card>

            <Card>
              <Card.Title>Telecom Packages</Card.Title>
              <Card.Image
                style={{ padding: 0 }}
                source={{
                  uri: 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/telecom.png'
                }}
              />
              <Text style={styles.description}>
                Stay connected during your Singapore adventure with tailored telecom packages designed especially for tourists.
                Choose from a variety of cost-effective plans and make the most of your visit with our telecom packages!
              </Text>
              <Button style={styles.button} text = "VIEW MORE" mode="contained" onPress={viewAttractions}/>
            </Card>

            <Card>
              <Card.Title>Deals and Discount</Card.Title>
              <Card.Image
                style={{ padding: 10 }}
                source={{
                  uri: 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/discount.png'
                }}
              />
              <Text style={styles.description}>
                Unlock unbeatable deals and discounts that add extra value to your Singapore journey. Don't miss out
                on the chance to save while indulging in the best Singapore can offer!
              </Text>
              <Button style={styles.button} text = "VIEW MORE" mode="contained" onPress={viewAttractions}/>
            </Card>
            
            <Button
                style={styles.button}
                text="Logout"
                mode="contained"
                onPress={onLogoutPressed}
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
  },
  button: {
    width: '98%'
  }
});