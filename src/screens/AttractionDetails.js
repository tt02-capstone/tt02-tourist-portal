import React , { useState, useEffect } from 'react'
import Background from '../components/CardBackground'
import Header from '../components/Header'
import Button from '../components/Button'
import { theme } from '../core/theme'
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { getAttraction } from '../redux/reduxAttractionDetails'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

const AttractionDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState([]);
    const [attraction, setAttraction] = useState([]);
    const [priceList, setPriceList] = useState([]);
    const [loading, setLoading] = useState(false);

    const route = useRoute();
    const { attractionId } = route.params;

    async function getUser() {
        const data = await AsyncStorage.getItem('user');
        const user = JSON.parse(data); // only one user 
        const userType = user.userTypeEnum; // can get any attribute u wan
    
        setUser(user);
        console.log(user);
    }

    const formattedPriceList = priceList.map(item => {
        return `\n${item.ticket_type}: Local $${item.local_amount}, Tourist $${item.tourist_amount}`;
    });

    useEffect(() => {
        const fetchData = async() => {
            try {
                let attraction = await getAttraction(attractionId);
                setAttraction(attraction);
                setPriceList(attraction.price_list);
                // console.log(attraction.attraction_image_list[0]);
                console.log(attraction);
                setLoading(false);
            } catch (error) {
                alert ('An error occur! Failed to retrieve attraction list!');
                setLoading(false);
            }    
        };
        getUser();
        fetchData();
    }, []);

    return user ? (
        <Background>
            <Card>
                <Card.Title style={styles.header}>
                    {attraction.name}
                </Card.Title>
                
                <Text style={[styles.subtitle]}>{attraction.address}</Text>
                <Text style={styles.subtitle}>Operating Hours: {attraction.opening_hours}</Text>
                {/* <Card.Image
                    style={{ padding: 0}}
                    source={{
                    uri:attraction.attraction_image_list[0] // KIV for image 
                    }}
                /> */}
                <Text style={styles.description}>{attraction.description}</Text>

                <Text style={styles.description}>{attraction.age_group}</Text>
            </Card>
            
            <Card containerStyle={styles.dropBorder}>
                <Card.Title style={styles.header}>
                    Ticket Pricing
                </Card.Title>

                <Text style={styles.pricing}>{formattedPriceList}</Text>
            </Card>

            <Card containerStyle={styles.dropBorder}>
                <Card.Title style={styles.header}>
                    Nearby Recommendation
                </Card.Title>
            </Card>
        </Background>
    ) : 
    (
        navigation.navigate('LoginScreen')
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header:{
        textAlign: 'left',
    },
    image: {
      width: 30,height: 30,marginRight: 10,
    },
    name: {
      fontSize: 16,marginTop: 5,
    },
    subtitle: {
        marginBottom: 5, fontSize: 13, color: 'grey'
    },
    description: {
      marginBottom: 10, fontSize: 13, marginTop : 10 
    },
    pricing: {
        marginBottom: 0, fontSize: 13, marginTop : 0
    },
    recommendation:{
        marginBottom: 10, textAlign: 'center', marginTop : 10 
    },
    dropBorder: {
        borderWidth: 0, 
        shadowColor: 'rgba(0,0,0, 0.0)',
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        backgroundColor: theme.colors.surface,
    }
});

export default AttractionDetailsScreen