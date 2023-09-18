import React , { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import { Button } from 'react-native-paper';
import CartButton from '../../components/Button';
import { theme } from '../../core/theme'
import { getUser, getUserType, storeUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import { Text, Card } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import { DatePickerInput } from 'react-native-paper-dates';
import { getAttraction, getAttractionRecommendation, saveAttraction , checkTicketInventory} from '../../redux/reduxAttraction'; 
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";

const AttractionDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [attraction, setAttraction] = useState([]);
    const [recommendation, setRecommendation] = useState([]);
    const [priceList, setPriceList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState();

    const route = useRoute();
    const { attractionId } = route.params;

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    
        const usertype =  await getUserType()
    }

    const [quantityByTicketType, setQuantityByTicketType] = useState({});
    
    const handleIncrease = (ticketType) => {
        setQuantityByTicketType((prevQuantity) => {
          const updatedQuantity = {
            ...prevQuantity,
            [ticketType]: (prevQuantity[ticketType] || 0) + 1,
          };
          return updatedQuantity;
        });
    };
    
    const handleDecrease = (ticketType) => {
        setQuantityByTicketType((prevQuantity) => {
          const updatedQuantity = {
            ...prevQuantity,
            [ticketType]: Math.max((prevQuantity[ticketType] || 0) - 1, 0),
          };
          return updatedQuantity;
        });
    };

    const formattedPriceList = priceList.map(item => {
        const userType = user.user_type; 
        const amount = userType === 'TOURIST' ? item.tourist_amount : item.local_amount;
        const ticket_type = item.ticket_type;

        return {
            ...item, 
            userType,
            amount,
            ticket_type
        };
    });

    const addToCart = async () => {
        const selectedTickets = [];
        if (!selectedDate) { // check if date is selected 
            Toast.show({
                type: 'error',
                text1: "Please Select a Booking Date!"
            })

        } else {
            // format date
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0'); // format to current timezone 
            const formattedDate = `${year}-${month}-${day}`;

            for (const ticketType in quantityByTicketType) { 
                if (quantityByTicketType[ticketType] > 0) {
                    selectedTickets.push({
                        ticket_type: ticketType,
                        ticket_date: formattedDate,
                        ticket_count: quantityByTicketType[ticketType],
                        ticket_price: formattedPriceList.find(item => item.ticket_type === ticketType).amount // price per ticket 
                    });
                }
            }

            if (selectedTickets.length === 0) { // when ticket date is select but ticket types quantity r all 0
                Toast.show({
                    type: 'error',
                    text1: "Please Select your Ticket Quantity!"
                })

            } else { // when both ticket date + ticket types are selected 
                let checkInventory = await checkTicketInventory(attraction.attraction_id,formattedDate,selectedTickets);
                
                if (checkInventory.status) {
                    Toast.show({
                        type: 'error',
                        text1: checkInventory.error
                    })
                } else {
                    // continue w any logic u need here 
                    Toast.show({
                        type: 'success',
                        text1: 'Attraction Ticket(s) Added to Cart!'
                    });
                }
            }
        }
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

    const fetchAttraction = async() => {
        try {
            let attraction = await getAttraction(attractionId);
            setAttraction(attraction);
            setPriceList(attraction.price_list);

            let reccoms = await getAttractionRecommendation(attractionId);
            setRecommendation(reccoms)

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

    return (
        <Background>
            <ScrollView>
                <Card>
                    <Card.Title style={styles.header}>
                        {attraction.name} 
                        <Button mode="text" style={{ marginTop: -13}} onPress={saveAttr} >
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
                        Tickets
                    </Card.Title>

                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 360, height: 100 , marginTop: -15}}>
                        <DatePickerInput
                            locale='en-GB'
                            format
                            label="Ticket Booking Date"
                            value={selectedDate}
                            onChange={(d) => setSelectedDate(d)}
                            inputMode="start"
                        />
                    </View>

                    <View>
                        {formattedPriceList.map(item => (
                            <View key={item.ticket_type} style={{ flexDirection: 'row', alignItems: 'center', width: 400, marginLeft: 10, marginBottom: 20}}>
                                <Text>{`${item.ticket_type} TICKET @ $${item.amount}`}</Text>
                                
                                <Button mode="contained" style={{backgroundColor: '#044537', color: "white", marginLeft: 40}} onPress={() => handleDecrease(item.ticket_type)}>
                                    -
                                </Button>
                                
                                <Text style={{ marginLeft: 20 }}>{quantityByTicketType[item.ticket_type] || 0}</Text>
                                
                                <Button mode="contained" style={{backgroundColor: '#044537', color: "white", marginLeft: 20}} onPress={() => handleIncrease(item.ticket_type)}>
                                    +
                                </Button>

                            </View>
                        ))}
                        
                    </View>
                </Card>

                <View style={styles.cartOut}> 
                    <CartButton 
                        style = {styles.cartButton}
                        text = "Add to Cart" 
                        mode="contained" 
                        onPress={addToCart}
                    />
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
        color: '#044537',
        flexDirection: 'row'
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
        width: 330,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartButton:{
        marginTop: -5,
        width: '110%'
    }
    
});

export default AttractionDetailsScreen