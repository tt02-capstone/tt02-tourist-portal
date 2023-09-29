import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import { Button } from 'react-native-paper';
import CartButton from '../../components/Button';
import { theme } from '../../core/theme'
import { getUser, getUserType, storeUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import { DatePickerInput } from 'react-native-paper-dates';
import {getAccommodation, toggleSaveAccommodation} from '../../redux/reduxAccommodation';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { cartApi } from '../../helpers/api';

const AccommodationDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [accommodation, setAccommodation] = useState([]);
    const [roomList, setRoomList] = useState([]);
    // const [attrTicketList, setAttrTicketList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState();
    // const [formattedPriceList, setFormattedPriceList] = useState([]);
    // const [quantityByRoomType, setQuantityByRoomType] = useState({});
    // const [seasonalActivity, setSeasonalActivity] = useState([]);
    const route = useRoute();
    const [isSaved, setIsSaved] = useState(false);

    const { accommodationId } = route.params;

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)

        const usertype = await getUserType()
    }

    // const handleIncrease = (roomType) => {
    //     setQuantityByRoomType((prevQuantity) => {
    //       const updatedQuantity = {
    //         ...prevQuantity,
    //         [roomType]: (prevQuantity[roomType] || 0) + 1,
    //       };
    //       return updatedQuantity;
    //     });
    // };

    // const handleDecrease = (roomType) => {
    //     setQuantityByRoomType((prevQuantity) => {
    //       const updatedQuantity = {
    //         ...prevQuantity,
    //         [roomType]: Math.max((prevQuantity[roomType] || 0) - 1, 0),
    //       };
    //       return updatedQuantity;
    //     });
    // };

    // const addToCart = async () => {
    //     const cartItems = [];
    //     const selectedRooms = [];
    //     const user_type = user.user_type;
    //     const tourist_email = user.email;
    //     const activity_name = accommodation.name;

    //     if (!selectedDate) { // check if date is selected 
    //         Toast.show({
    //             type: 'error',
    //             text1: "Please Select a Booking Date!"
    //         })
    //     } else {
    //         // format date
    //         const year = selectedDate.getFullYear();
    //         const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    //         const day = String(selectedDate.getDate()).padStart(2, '0'); // format to current timezone 
    //         const formattedDate = `${year}-${month}-${day}`;

    //         for (const roomType in quantityByRoomType) { 
    //             if (quantityByRoomType[roomType] > 0) {
    //                 cartItems.push({
    //                     type : "ATTRACTION",
    //                     activity_selection: roomType,
    //                     quantity: quantityByRoomType[roomType],
    //                     price: formattedPriceList.find(item => item.ticket_type === roomType).amount, // price per ticket
    //                     start_datetime: formattedDate,
    //                     end_datetime: formattedDate,
    //                 });

    //                 selectedRooms.push({
    //                     ticket_per_day_id: formattedPriceList.find(item => item.ticket_type === roomType).ticket_type_id, 
    //                     ticket_type: roomType,
    //                     ticket_date: formattedDate,
    //                     ticket_count: quantityByRoomType[roomType],
    //                     ticket_price: formattedPriceList.find(item => item.ticket_type === roomType).amount // price per ticket 
    //                 });

    //             }
    //         }

    //         if (selectedRooms.length === 0) { // when ticket date is select but ticket types quantity r all 0
    //             Toast.show({
    //                 type: 'error',
    //                 text1: "Please Select your Ticket Quantity!"
    //             })

    //         } else {  // when both ticket date + ticket types are selected 
    //             let checkInventory = await checkTicketInventory(accommodation.accommodation_id,formattedDate,selectedRooms);
    //             // current date check 
    //             const currentDate = new Date();

    //             const year = currentDate.getFullYear();
    //             const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    //             const day = String(currentDate.getDate()).padStart(2, '0');
    //             const dateNow = `${year}-${month}-${day}`;

    //             if (dateNow > formattedDate) { // check for date selected since UI cant block dates before tdy
    //                 Toast.show({
    //                     type: 'error',
    //                     text1: 'Date selected should be today or after!'
    //                 })
    //             } else if (checkInventory.status) {
    //                 Toast.show({
    //                     type: 'error',
    //                     text1: checkInventory.error
    //                 })
    //             } else {
    //                 const response = await cartApi.post(`/addCartItems/${user_type}/${tourist_email}/${activity_name}`, cartItems);
    //                 console.log(response.data.httpStatusCode)
    //                 if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
    //                     Toast.show({
    //                         type: 'error',
    //                         text1: 'Unable to add items to cart'
    //                     });
    //                 } else {
    //                     console.log('success', response.data)
    //                     setSelectedDate(null); // must have = use this to reset date selection 
    //                     setQuantityByRoomType(0) // must have = reset the quantity as well to 0 
    //                     if (response.data) {
    //                         Toast.show({
    //                             type: 'success',
    //                             text1: 'Added Items to Cart!'
    //                         });
    //                     // Update Cart Badge 
    //                     } else {
    //                         Toast.show({
    //                             type: 'error',
    //                             text1: 'Unable to add items to cart'
    //                         });
    //                     }
    //                 }
    //             }
    //         }
    //     };
    // }

    const getColorForType = (label) => {
        const labelColorMap = {
            'HOTEL': 'lightblue',
            'AIRBNB': 'lightgreen',
        };

        return labelColorMap[label] || 'gray';
    };

    const fetchAccommodation = async () => {
        try {
            let accommodation = await getAccommodation(accommodationId);
            setAccommodation(accommodation);
            setRoomList(accommodation.room_list);
            console.log("accommodation", accommodation);
            // setAttrTicketList(accommodation.ticket_per_day_list);

            // let activity = await getSeasonalActivity(accommodationId);
            // if (activity != []) {
            //     setSeasonalActivity(activity); // get seasonal
            // }

            // let reccoms = await getAccommodationRecommendation(accommodationId);
            // setRecommendation(reccoms)

            setLoading(false);
            fetchUser();
        } catch (error) {
            console.log("error", error)
            alert('An error occurred! Failed to retrieve accommodation list!');
            setLoading(false);
        }
    }

    // const fetchPrice = () => {
    //     const formattedPriceList = priceList.map(item => {
    //         const userType = user.user_type; 
    //         const amount = userType === 'TOURIST' ? item.tourist_amount : item.local_amount;
    //         const ticket_type = item.ticket_type;

    //         let ticket_count = 0; // default value 
    //         let ticket_type_id = null;

    //         if (selectedDate) {
    //             // format date 
    //             const year = selectedDate.getFullYear();
    //             const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    //             const day = String(selectedDate.getDate()).padStart(2, '0'); // format to current timezone 
    //             const formattedDate = `${year}-${month}-${day}`;
    //             const matchingTicket = attrTicketList.find(ticket => 
    //                 ticket.ticket_type === ticket_type && ticket.ticket_date === formattedDate
    //             );

    //             if (matchingTicket) {
    //                 ticket_count = matchingTicket.ticket_count;
    //                 ticket_type_id = matchingTicket ? matchingTicket.ticket_per_day_id : null;
    //             }
    //         }

    //         return {
    //             ...item, 
    //             userType,
    //             amount,
    //             ticket_type,
    //             ticket_type_id,
    //             ticket_count
    //         };
    //     });

    //     setFormattedPriceList(formattedPriceList)
    // }

    useEffect(() => {
        fetchAccommodation(); // when the page load the first time
        // fetchPrice();
    }, [selectedDate]);

    function formatLocalDateTime(localDateTimeString) {
        const dateTime = new Date(localDateTimeString);
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        return dateTime.toLocaleTimeString([], timeOptions);
    }

    function toTitleCase(str) {
        return str ? str
            .toLowerCase()
            .split('_') 
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            : ''
            ;
    }

    useEffect(() => {
        if (user) {
            let saved = false;
            for (var i = 0; i < user.accommodation_list.length; i++) {
                if(user.accommodation_list[i].accommodation_id === accommodationId) {
                    saved = true;
                    break;
                }
            }
            setIsSaved(saved);
        }
    }, [user])

    // add to saved listing
    const save = async () => {
        let response = await toggleSaveAccommodation(user.user_id, accommodation.accommodation_id);
        console.log('toggle res', response.data)
        if (response.status) {
            if (!isSaved) {
                setIsSaved(true);
                let obj = {
                    ...user,
                    accommodation_list: response.data
                }
                await storeUser(obj);
                fetchUser();
                Toast.show({
                    type: 'success',
                    text1: 'Accommodation has been saved!'
                });
            } else {
                setIsSaved(false);
                let obj = {
                    ...user,
                    accommodation_list: response.data
                }

                await storeUser(obj);
                fetchUser();
                Toast.show({
                    type: 'success',
                    text1: 'Accommodation has been unsaved!'
                });
            }

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
                <Card>
                    <Card.Title style={styles.header}>
                        {accommodation.name}
                        <Button mode="text" style={{ marginTop: -10}} onPress={save} >
                            {isSaved && <Icon name="heart" size={20} color='red' />}
                            {!isSaved && <Icon name="heart" size={20} color='grey'/>}
                        </Button>
                    </Card.Title>

                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.tag, { backgroundColor: getColorForType(accommodation.type) }]}>{accommodation.type}</Text>
                        <Text style={[styles.tag, { backgroundColor: 'purple', color: 'white' }]}>{accommodation.estimated_price_tier}</Text>
                    </View>

                    <Text style={[styles.subtitle]}>{accommodation.address}</Text>
                    <Text style={styles.description}>{accommodation.description}</Text>
                    <Text style={styles.details}>
                        <Text style={styles.boldText}>Area:</Text> {toTitleCase(accommodation.generic_location)}
                    </Text>

                    <Text style={styles.details}>
                        <Text style={styles.boldText}>Contact Number:</Text> {accommodation.contact_num}
                    </Text>
                    <Text style={styles.details}>
                        <Text style={styles.boldText}>Check In Time:</Text>{' '}
                        {formatLocalDateTime(accommodation.check_in_time)}
                    </Text>
                    <Text style={styles.details}>
                        <Text style={styles.boldText}>Check Out Time:</Text>{' '}
                        {formatLocalDateTime(accommodation.check_out_time)}
                    </Text>

                </Card>

                {/* <Card containerStyle={styles.dropBorder}>
                    <Card.Title style={styles.header}>
                        Rooms
                    </Card.Title>

                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 340, height: 100 , marginTop: -15}}>
                        <DatePickerInput
                            locale='en-GB'
                            format
                            label="Ticket Booking Date"
                            value={selectedDate}
                            onChange={(d) => setSelectedDate(d)}
                            inputMode="start"
                        />
                    </View> */}

                {/* <View>
                        {formattedPriceList.map(item => (
                            <View key={item.ticket_type} style={{ flexDirection: 'row', alignItems: 'center', width: 400, marginLeft: 10, marginBottom: 30}}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', width:120 }}>
                                    <Text style={{fontSize: 11, fontWeight:'bold'}}>{`${item.ticket_type} TICKET @ $${item.amount}`}{'\n'}{`Rooms Available: ${item.ticket_count}`}  </Text>
                                </View>
                                
                                <Button mode="contained" style={{backgroundColor: '#044537', color: "white", marginLeft: 20}} onPress={() => handleDecrease(item.ticket_type)}>
                                    -
                                </Button>
                                
                                <Text style={{ marginLeft: 20 }}>{quantityByRoomType[item.ticket_type] || 0}</Text>
                                
                                <Button mode="contained" style={{backgroundColor: '#044537', color: "white", marginLeft: 20}} onPress={() => handleIncrease(item.ticket_type)}>
                                    +
                                </Button>

                            </View>
                        ))}
                        
                    </View>
                </Card> */}

                {/* <View style={styles.cartOut}> 
                    <CartButton 
                        style = {styles.cartButton}
                        text = "Add to Cart" 
                        mode="contained" 
                        onPress={addToCart}
                    />
                </View> */}

                {/* <Card containerStyle={styles.dropBorder}>
                    <Card.Title style={styles.header}>
                        Nearby Recommendation
                    </Card.Title>

                    <ScrollView horizontal>
                        <View style={{ flexDirection: 'row', height: 350}}>
                            {
                                recommendation.length > 0 && recommendation.map((item, index) => (
                                    <TouchableOpacity key={index} onPress={() => viewRecommendedAccommodation(item.accommodation_id)}>
                                        <View style={styles.rCard}>
                                            <Card style={styles.reccom}>
                                                <Card.Title style={styles.header}>
                                                    {item.name} 
                                                </Card.Title>
                                                <Card.Image
                                                    style={{ padding: 0, width: 260, height: 100}}
                                                    source={{
                                                        uri: item.accommodation_image_list[0] // KIV for image 
                                                    }}
                                                />
                                                <Text style={{marginBottom: 15 }}></Text> 
                                                
                                                <View style={{ flexDirection : 'row' }}>
                                                    <Text style={[styles.tag, {backgroundColor:getColorForType(item.accommodation_category)}]}>{item.accommodation_category}</Text>
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
                </Card> */}
            </ScrollView>
        </Background>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    rCard: {
        flex: 1,
        width: 320,
        height: 100,
        borderRadius: 4,
        margin: 2
    },
    header: {
        textAlign: 'left',
        fontSize: 13,
        color: '#044537',
        flexDirection: 'row'
    },
    image: {
        width: 30, height: 30, marginRight: 10,
    },
    name: {
        fontSize: 16, marginTop: 5,
    },
    subtitle: {
        marginBottom: 5, fontSize: 12, color: 'grey'
    },
    description: {
        marginBottom: 10, fontSize: 12, marginTop: 10
    },
    details: {
        fontSize: 12
    },
    boldText: {
        fontWeight: 'bold',
    },
    activityHeader: {
        marginBottom: 5, fontSize: 12, fontWeight: "bold"
    },
    activity: {
        marginBottom: 5, fontSize: 11
    },
    pricing: {
        marginBottom: 0, fontSize: 12, marginTop: 0
    },
    recommendation: {
        marginBottom: 10, textAlign: 'center', marginTop: 10
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
    cartButton: {
        marginTop: -5,
        width: '100%',
        alignSelf: 'center',
    }

});

export default AccommodationDetailsScreen