import React , { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { getAttractionList  } from '../../redux/reduxAttraction';
import { clearStorage, getUser, getUserType } from '../../helpers/LocalStorage';

const AttractionScreen = ({ navigation }) => {
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
                let listOfAttractions = await getAttractionList();
                setData(listOfAttractions);
                setLoading(false);
            } catch (error) {
                alert ('An error occur! Failed to retrieve attraction list!');
                setLoading(false);
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

    const viewAttraction = (attraction_id) => {
        navigation.navigate('AttractionDetailsScreen', {attractionId : attraction_id}); // set the attraction id here 
    }

    return (
        <Background>
            <ScrollView>
                <View style={styles.container}>
                    { 
                        data.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => viewAttraction(item.attraction_id)}>
                            <Card>
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
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={[styles.tag, {backgroundColor:getColorForType(item.attraction_category)}]}>{item.attraction_category}</Text>
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

export default AttractionScreen