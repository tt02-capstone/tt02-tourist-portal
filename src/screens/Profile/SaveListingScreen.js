import React , { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import Button from '../../components/Button';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { getUser, getUserType, storeUser } from '../../helpers/LocalStorage';
import { getSavedAttractionList, deleteSavedAttraction } from '../../redux/reduxAttraction';
import Toast from "react-native-toast-message";

const SavedListingScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [data, setData] = useState([]);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    async function updateData() {
        const savedAttractions = await getSavedAttractionList(user.user_id);
        setData(savedAttractions);
    }

    useEffect(() => {
        const fetchData = async() => {
            try {
                const userData = await getUser()
                setUser(userData)

                let savedAttractions = await getSavedAttractionList(userData.user_id);
                setData(savedAttractions);
            } catch (error) {
                alert ('An error occur! Failed to retrieve saved attraction listing!');
            }    
        };
        fetchUser();
        fetchData();
    }, []);

    const getColorForType = (label) => {
        const labelColorMap = {
          'HISTORICAL': 'lightblue',
          'CULTURAL': 'lightgreen',
          'NATURE': 'orange',
          'ADVENTURE' : 'yellow',
          'SHOPPING' : 'turquoise',
          'ENTERTAINMENT' : 'lightpink'
        };

        return labelColorMap[label] || 'gray';
    };

    const viewListing = (attraction_id) => {
        navigation.navigate('AttractionDetailsScreen', {attractionId : attraction_id}); // set the attraction id here 
    }

    const removeListing = async (attraction_id) => {
        let response = await deleteSavedAttraction(user.user_id,attraction_id);
        if (!response.status) {
            await storeUser(response.info); // update the user in local storage 
            fetchUser();
            Toast.show({
                type: 'success',
                text1: 'Listing has been removed!'
            });

            updateData();
        } else {
            Toast.show({
                type: 'error',
                text1: response.info
            })
        }
    }

    return (
        <Background>
            <ScrollView>
                <View style={styles.container}>
                    { 
                        data.map((item, index) => (
                            <Card key={index}>
                                <Card.Title style={styles.header}>
                                    {item.name} 
                                </Card.Title>
                                <Card.Image
                                    style={{ padding: 0}}
                                    source={{
                                    uri: item.attraction_image_list[0] // KIV for image 
                                    }}
                                />

                                <Text style={styles.description}>{item.description}</Text>
                                <View style={{ flexDirection: 'row'}}>
                                    <Text style={[styles.tag, {backgroundColor:getColorForType(item.attraction_category)}]}>{item.attraction_category}</Text>
                                    <Text style={[styles.tag, {backgroundColor:'purple', color: 'white'}]}>{item.estimated_price_tier}</Text>
                                </View>

                                <View style={{ flexDirection: 'row'}}>
                                    <Button style={styles.button} text = "REMOVE" mode="contained" onPress={() => removeListing(item.attraction_id)} />
                                    <Button style={styles.button} text = "VIEW MORE" mode="contained" onPress={() => viewListing(item.attraction_id)}/>
                                </View>

                            </Card>
                        )) 
                    }
                </View>
            </ScrollView>
        </Background>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    fonts: {
      marginBottom: 8,
    },
    user: {
      flexDirection: 'row',marginBottom: 6,
    },
    image: {
      width: 30,height: 30,marginRight: 10,
    },
    name: {
      fontSize: 16,marginTop: 5,
    },
    description: {
      marginBottom: 20, fontSize: 13, marginTop : 10 
    },
    tag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 110,
        fontSize: 11,
        fontWeight: 'bold'
    },
    header:{
        color: '#044537',
        fontSize: 15
    },
    button: {
        width: "50%"
    }
});

export default SavedListingScreen