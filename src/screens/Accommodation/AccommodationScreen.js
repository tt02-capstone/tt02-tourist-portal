import React , { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { getAccommodationList  } from '../../redux/reduxAccommodation';
import { clearStorage, getUser, getUserType } from '../../helpers/LocalStorage';

const AccommodationScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    
        const usertype =  await getUserType()
    }

    useEffect(() => {
        const fetchData = async() => {
            try {
                let listOfAccommodations = await getAccommodationList();
                setData(listOfAccommodations);
                setLoading(false);
            } catch (error) {
                alert ('An error occur! Failed to retrieve accommodation list!');
                setLoading(false);
            }    
        };
        fetchUser();
        fetchData();
    }, []);

    const getColorForType = (label) => {
        const labelColorMap = {
          'HOTEL': 'lightblue',
          'AIRBNB': 'lightgreen',
        };

        return labelColorMap[label] || 'gray';
    };

    const viewAccommodation = (accommodation_id) => {
        navigation.navigate('AccommodationDetailsScreen', {accommodationId : accommodation_id}); // set the accommodation id here 
    }

    return (
        <Background>
            <ScrollView>
                <View style={styles.container}>
                    { 
                        data.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => viewAccommodation(item.accommodation_id)}>
                            <Card>
                                <Card.Title style={styles.header}>
                                    {item.name} 
                                </Card.Title>
                                <Card.Image
                                    style={{ padding: 0}}
                                    source={{
                                    uri: item.accommodation_image_list[0]
                                    }}
                                />

                                <Text style={styles.description}>{item.description}</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={[styles.tag, {backgroundColor:getColorForType(item.type)}]}>{item.type}</Text>
                                    <Text style={[styles.tag, {backgroundColor:'purple', color: 'white'}]}>{item.estimated_price_tier}</Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
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
    }
});

export default AccommodationScreen