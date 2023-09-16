import React , { useState, useEffect } from 'react'
import Background from '../components/CardBackground'
import { Button } from 'react-native-paper';
import CartButton from '../components/Button'
import { theme } from '../core/theme'
import { clearStorage, getUser, getUserType } from '../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Card, CheckBox } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getAttraction, getAttractionRecommendation, saveAttraction } from '../redux/reduxAttractionDetails'; 
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import {storeUser} from "../helpers/LocalStorage";
import { cartApi } from '../helpers/api';

const AttractionDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [attraction, setAttraction] = useState([]);
    const [recommendation, setRecommendation] = useState([]);
    const [priceList, setPriceList] = useState([]);
    const [checkedBoxes, setCheckedBoxes] = useState([]);
    const [loading, setLoading] = useState(false);

    const route = useRoute();
    const { attractionId } = route.params;

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    
        const usertype =  await getUserType()
    }

    const formattedPriceList = priceList.map(item => {
        const userType = user.userTypeEnum; // can get any attribute u wan
        const amount = userType === 'TOURIST' ? item.tourist_amount : item.local_amount;

        return (
            <CheckBox
              key={item.ticket_type}
              title={`${item.ticket_type} TICKET @ $${amount}`}
              checked={checkedBoxes.includes(item.ticket_type)} 
              onPress={() => handleCheckboxChange(item.ticket_type)}
            />
            
        );
    });

    const handleCheckboxChange = (label) => {
        setCheckedBoxes((prevCheckedBoxes) => {
          if (prevCheckedBoxes.includes(label)) {
            return prevCheckedBoxes.filter((box) => box !== label);
          } else {
            return [...prevCheckedBoxes, label];
          }
        });
    };

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

    const fetchAttraction = async() => {
        try {
            let attraction = await getAttraction(attractionId);
            setAttraction(attraction);
            setPriceList(attraction.price_list);

            //let reccoms = await getAttractionRecommendation(attractionId);
            //setRecommendation(reccoms)

            setLoading(false);
            fetchUser();
        } catch (error) {
            alert ('An error occur! Failed to retrieve attraction list!');
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAttraction(); // when the page load the first time
    }, []);

    const viewRecommendedAttraction = (redirect_attraction_id) => {
        navigation.push('AttractionDetailsScreen', {attractionId : redirect_attraction_id}); // push on to the nxt nav stack 
    }

    const saveAttr = async () => {
        let response = await saveAttraction(user.user_id, attraction.attraction_id);
        if (!response.status) {
            await storeUser(response.info); // update the user in local storage 
            fetchUser();
            Toast.show({
                type: 'success',
                text1: 'Attraction has been saved!'
            });

        } else {
            Toast.show({
                type: 'error',
                text1: response.info
            })
        }
    }

    const toCart = async () => {
        const user_type = user.userTypeEnum;
        const tourist_email = user.email;
        const activity_name = attraction.name;
        const cartItems = [];

        for (const type of checkedBoxes) {
            const cartItem = {}
            cartItem.type = "ATTRACTION";
            cartItem.activity_selection = type
            cartItem.quantity = 1;
            cartItem.start_datetime = new Date();
            cartItem.end_datetime = new Date();
            cartItem.price = 0;
            cartItems.push(cartItem);
            
        }

        const response = await cartApi.post(`/addCartItems/${user_type}/${tourist_email}/${activity_name}`, cartItems);
        console.log(response.data.httpStatusCode)
        if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
            console.log('error',response.data)
  
        } else {
            console.log('success', response.data)
            if (response.data) {
              Toast.show({
                type: 'success',
                text1: 'Added Items to Cart!'
            });
            // Update Cart Badge 
              
            } else {
              Toast.show({
                type: 'error',
                text1: 'Unable to add items to cart'
            });
            }
  
  
        };
      


    }

    return (
        <Background>
            <ScrollView>
                <Card>
                    <Card.Title style={styles.header}>
                        {attraction.name} 
                        <Button mode="text" style={styles.save} onPress={saveAttr}>
                            <Icon name="heart" size={20} color='blue'/>
                        </Button>
                    </Card.Title>
                    
                    <Text style={[styles.subtitle]}>{attraction.address}</Text>
                    <Text style={styles.subtitle}>Operating Hours: {attraction.opening_hours}</Text>
                    <Text style={styles.description}>{attraction.description}</Text>
                    <Text style={styles.description}>{attraction.age_group}</Text>
                </Card>
                
                <Card containerStyle={styles.dropBorder}>
                    <Card.Title style={styles.header}>
                        Ticket Pricing
                    </Card.Title>
                    <>{formattedPriceList}</>
                </Card>

                <View style={styles.cartOut}> 
                    <CartButton text = "Add to Cart" mode="contained" onPress={toCart}/>
                </View>
        
                <Card containerStyle={styles.dropBorder}>
                    <Card.Title style={styles.header}>
                        Nearby Recommendation
                    </Card.Title>

                    <ScrollView horizontal>
                        <View style={{ flexDirection: 'row', height: 350}}>
                            {
                                recommendation.map((item, index) => (
                                    <TouchableOpacity key={index} onPress={() => viewRecommendedAttraction(item.attraction_id)}>
                                        <View style={styles.rCard}>
                                            <Card style={styles.reccom}>
                                                <Card.Title style={styles.header}>
                                                    {item.name} 
                                                </Card.Title>
                                                <Card.Image
                                                    style={{ padding: 0, width: 260, height: 100}}
                                                    source={{
                                                    // uri: item.attraction_image_list[0] // KIV for image 
                                                    }}
                                                />
                                                <Text style={{marginBottom: 15 }}></Text> 
                                                
                                                <View style={{ flexDirection : 'row' }}>
                                                    <Text style={[styles.tag, {backgroundColor:getColorForType(item.attraction_category)}]}>{item.attraction_category}</Text>
                                                    <Text style={[styles.tag, {backgroundColor:'purple', color: 'white'}]}>{item.estimated_price_tier}</Text>
                                                </View>
                                            </Card>

                                            <Text style={{marginBottom: 15 }}></Text> 
                                        </View>
                                    </TouchableOpacity>
                                )) 
                            }
                        </View>
                    </ScrollView>
                </Card>
            </ScrollView>
        </Background>
    ) 
}

const styles = StyleSheet.create({
    container:{
        flex:1
    },
    rCard:{
        flex:1,
        width: 320,
        height: 100,
        borderRadius: 4,
        margin: 2
    },
    header:{
        textAlign: 'left',
        fontSize: 15,
        color: '#044537'
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
    tag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 90,
        fontSize: 10,
        fontWeight: 'bold'
    },
    dropBorder: {
        borderWidth: 0, 
        shadowColor: 'rgba(0,0,0, 0.0)',
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        backgroundColor: theme.colors.surface,
    },
    cartOut: {
        width: 360,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default AttractionDetailsScreen