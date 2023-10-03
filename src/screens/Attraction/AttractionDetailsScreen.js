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
import { getAttraction, saveAttraction, checkTicketInventory, getSeasonalActivity } from '../../redux/reduxAttraction';
import { getRecommendation } from '../../redux/recommendationRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { cartApi } from '../../helpers/api';
import { getAllTourTypesByAttraction } from '../../redux/tourRedux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import AttractionRecom from '../Recommendation/AttractionRecom';
import RestaurantRecom from '../Recommendation/RestaurantRecom';
import AccommodationRecom from '../Recommendation/AccommodationRecom';
import { timeZoneOffset } from "../../helpers/DateFormat";
import Carousel, { Pagination } from 'react-native-snap-carousel';

const AttractionDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [attraction, setAttraction] = useState([]);
    const [recommendation, setRecommendation] = useState([]);
    const [priceList, setPriceList] = useState([]);
    const [attrTicketList, setAttrTicketList] = useState([]);
    const [imageList, setImageList] = useState([]);
    const [imageActiveSlide, setImageActiveSlide] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState();
    const [formattedPriceList, setFormattedPriceList] = useState([]);
    const [quantityByTicketType, setQuantityByTicketType] = useState({});
    const [seasonalActivity, setSeasonalActivity] = useState("");
    const route = useRoute();
    const { attractionId } = route.params;
    const [tours, setTours] = useState([]);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)

        const usertype = await getUserType()
    }

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

    const addToCart = async () => {
        const cartItems = [];
        const selectedTickets = [];
        const user_type = user.user_type;
        const tourist_email = user.email;
        const activity_name = attraction.name;
        const tourCartItems = [];
        let tourCartPayload = '';

        if (!selectedDate) { // check if date is selected 
            Toast.show({
                type: 'error',
                text1: "Please Select a Booking Date!"
            })
        } else {
            // format date
            selectedDate.setHours(selectedDate.getHours() + timeZoneOffset);
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0'); // format to current timezone 
            const formattedDate = `${year}-${month}-${day}`;
            let noOfPax = 0;

            for (const ticketType in quantityByTicketType) {
                if (quantityByTicketType[ticketType] > 0) {
                    cartItems.push({
                        type: "ATTRACTION",
                        activity_selection: ticketType,
                        quantity: quantityByTicketType[ticketType],
                        price: formattedPriceList.find(item => item.ticket_type === ticketType).amount, // price per ticket
                        start_datetime: formattedDate,
                        end_datetime: formattedDate,
                    });
                    noOfPax += quantityByTicketType[ticketType];

                    selectedTickets.push({
                        ticket_per_day_id: formattedPriceList.find(item => item.ticket_type === ticketType).ticket_type_id,
                        ticket_type: ticketType,
                        ticket_date: formattedDate,
                        ticket_count: quantityByTicketType[ticketType],
                        ticket_price: formattedPriceList.find(item => item.ticket_type === ticketType).amount // price per ticket 
                    });

                }
            }

            let tourId = '';
            if (noOfPax > 0) {
                await AsyncStorage.getItem('selectedTourId')
                    .then((value) => {
                        if (value !== null) {
                            tourId = value;
                            console.log('selectedTourId retrieved from AsyncStorage: ', tourId);
                        } else {
                            tourId = null;
                            console.log('Data not found in AsyncStorage');
                        }
                    })
                    .catch((error) => {
                        console.error('Error retrieving data from AsyncStorage: ', error);
                    });

                let selectedTourType = '';
                await AsyncStorage.getItem('selectedTourType')
                    .then((value) => {
                        if (value !== null) {
                            selectedTourType = JSON.parse(value);
                            console.log('selectedTourType retrieved from AsyncStorage: ', selectedTourType);
                        } else {
                            selectedTourType = null;
                            console.log('Data not found in AsyncStorage');
                        }
                    })
                    .catch((error) => {
                        console.error('Error retrieving data from AsyncStorage: ', error);
                    });

                let tour = '';
                if (selectedTourType != null) {
                    tour = selectedTourType.tour_list.find(tour => tour.tour_id == tourId);
                }

                const formatTime = (time) => {
                    return moment(time).format('h:mm A');
                }

                if (tourId != null) {
                    cartItems.push({
                        type: "TOUR",
                        activity_selection: `${selectedTourType.name} (${formatTime(tour.start_time)} - ${formatTime(tour.end_time)})`,
                        // my logic is to just store the noofpax as the quantity then adjust it accordingly on the cart side anyways u will need tat no. later on as well
                        // and this num is dependent on how many tickets they gonna buy 
                        // then for the price just take the per pax price so it will be easier to muniplate on the cart side 
                        // quantity: 1
                        quantity: noOfPax,
                        // price: (selectedTourType.price * noOfPax),
                        price: (selectedTourType.price),
                        start_datetime: formattedDate,
                        end_datetime: formattedDate,
                    });

                    tourCartItems.push({
                        type: "TOUR",
                        activity_selection: `${selectedTourType.name} (${formatTime(tour.start_time)} - ${formatTime(tour.end_time)})`,
                        // quantity: 1,
                        quantity: noOfPax,
                        // price: (selectedTourType.price * noOfPax),
                        price: (selectedTourType.price),
                        start_datetime: formattedDate,
                        end_datetime: formattedDate,
                    });

                    tourCartPayload = {
                        start_datetime: tour.date,
                        end_datetime: tour.date,
                        type: "TOUR",
                        activity_name: `${selectedTourType.name} (${formatTime(tour.start_time)} - ${formatTime(tour.end_time)})`,
                        cart_item_list: tourCartItems
                    }
                }
            }

            if (selectedTickets.length === 0) { // when ticket date is select but ticket types quantity r all 0
                Toast.show({
                    type: 'error',
                    text1: "Please Select your Ticket Quantity!"
                })

            } else {  // when both ticket date + ticket types are selected 
                let checkInventory = await checkTicketInventory(attraction.attraction_id, formattedDate, selectedTickets);
                // current date check 
                const currentDate = new Date();

                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                const dateNow = `${year}-${month}-${day}`;

                if (dateNow > formattedDate) { // check for date selected since UI cant block dates before tdy
                    Toast.show({
                        type: 'error',
                        text1: 'Date selected should be today or after!'
                    })
                } else if (checkInventory.status) {
                    Toast.show({
                        type: 'error',
                        text1: checkInventory.error
                    })
                } else {
                    const response = await cartApi.post(`/addCartItems/${user_type}/${tourist_email}/${activity_name}`, cartItems);
                    console.log('attractions', response.data.httpStatusCode);
                    // const tourResponse = await cartApi.post(`/addTourToCart/${user.user_id}/${tourId}`, tourCartPayload);
                    // console.log('tours', tourResponse.data.httpStatusCode);
                    if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404
                        // || tourResponse.data.httpStatusCode === 400 || tourResponse.data.httpStatusCode === 404
                    ) {
                        Toast.show({
                            type: 'error',
                            text1: 'Unable to add items to cart'
                        });
                    } else {
                        console.log('success', response.data)
                        setSelectedDate(null); // must have = use this to reset date selection 
                        setQuantityByTicketType(0) // must have = reset the quantity as well to 0 

                        AsyncStorage.removeItem('selectedTourId')
                            .then(() => {
                                console.log(`Cleared AsyncStorage for selectedTourId`);
                            })
                            .catch((error) => {
                                console.error('Error clearing AsyncStorage: ', error);
                            });
                        AsyncStorage.removeItem('selectedTourType')
                            .then(() => {
                                console.log(`Cleared AsyncStorage for selectedTourType`);
                            })
                            .catch((error) => {
                                console.error('Error clearing AsyncStorage: ', error);
                            });

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
                    }
                }
            }
        };
    }

    // factor for recommendations 
    const viewRecommendedAttraction = (redirect_attraction_id) => {
        navigation.push('AttractionDetailsScreen', { attractionId: redirect_attraction_id });
    }

    const viewRecommendedRest = (redirect_rest_id) => {
        navigation.push('RestaurantDetailsScreen', { restId: redirect_rest_id });
    }

    const viewRecommendedAccom = (redirect_accom_id) => {
        navigation.push('AccommodationDetailsScreen', { accommodationId: redirect_accom_id });
    }

    const handleItemClick = (item) => {
        if (item.listing_type === "ATTRACTION") {
            viewRecommendedAttraction(item.attraction_id);
        } else if (item.listing_type === "RESTAURANT") {
            viewRecommendedRest(item.restaurant_id);
        } else if (item.listing_type === "ACCOMMODATION") {
            viewRecommendedAccom(item.accommodation_id);
        }
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

    const fetchAttraction = async () => {
        try {
            let attraction = await getAttraction(attractionId);
            setAttraction(attraction);
            setPriceList(attraction.price_list);
            setAttrTicketList(attraction.ticket_per_day_list);
            setImageList(attraction.attraction_image_list);


            let activity = await getSeasonalActivity(attractionId);
            if (activity !== undefined && activity.length != 0) {
                setSeasonalActivity(activity); // get seasonal
            }

            let recoms = await getRecommendation(attraction.generic_location, attraction.listing_type, attractionId);
            console.log('testing')
            console.log(recoms)
            if (recoms.status) {
                setRecommendation(recoms.data)
            }

            setLoading(false);
            fetchUser();
        } catch (error) {
            alert('An error occur! Failed to retrieve attraction list!');
            setLoading(false);
        }
    }

    const fetchPrice = () => {
        const formattedPriceList = priceList.map(item => {
            const userType = user.user_type;
            const amount = userType === 'TOURIST' ? item.tourist_amount : item.local_amount;
            const ticket_type = item.ticket_type;

            let ticket_count = 0; // default value 
            let ticket_type_id = null;

            if (selectedDate) {
                // format date 
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0'); // format to current timezone 
                const formattedDate = `${year}-${month}-${day}`;
                console.log('formattedDate', formattedDate);
                const matchingTicket = attrTicketList.find(ticket =>
                    ticket.ticket_type === ticket_type && ticket.ticket_date === formattedDate
                );
                if (matchingTicket) {
                    ticket_count = matchingTicket.ticket_count;
                    ticket_type_id = matchingTicket ? matchingTicket.ticket_per_day_id : null;
                }
            }

            return {
                ...item,
                userType,
                amount,
                ticket_type,
                ticket_type_id,
                ticket_count
            };
        });

        setFormattedPriceList(formattedPriceList)
    }

    const fetchTours = async () => {
        try {
            if (selectedDate != undefined) {
                setLoading(true);
                let response = await getAllTourTypesByAttraction(attractionId, selectedDate);
                setTours(response.data);
                setLoading(false);
            }
        } catch (error) {
            // alert('An error occurred! Failed to retrieve tours list!');
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAttraction(); // when the page load the first time
        fetchPrice();
        fetchTours();
    }, [selectedDate]);

    const viewMoreTours = () => {
        console.log(tours);
        navigation.navigate('TourScreen', { tours });
    };

    renderCarouselItem = ({ item }) => (
        <View>
            <Card.Image
                style={styles.cardImage}
                source={{ uri: item }}
            />
        </View>
    );

    const getColorForType = (label) => {
        const labelColorMap = {
            'HISTORICAL': 'lightblue',
            'CULTURAL': 'lightgreen',
            'NATURE': 'orange',
            'ADVENTURE': 'yellow',
            'SHOPPING': 'turquoise',
            'ENTERTAINMENT': 'lightpink'
        };

        return labelColorMap[label] || 'gray';
    };

    return (
        <Background>
            <ScrollView>
                <Card>
                    <Card.Title style={styles.header}>
                        {attraction.name}
                        <Button mode="text" style={{ marginTop: -13 }} onPress={saveAttr} >
                            <Icon name="heart" size={15} color='grey' />
                        </Button>
                    </Card.Title>

                    <View style={styles.tagContainer}>
                        <Text style={[styles.typeTag, { backgroundColor: getColorForType(attraction.attraction_category) }, { textAlign: 'center' },]}>
                            {attraction.attraction_category}
                        </Text>
                        <Text style={[styles.tierTag,{ backgroundColor: 'purple', color: 'white' },{ textAlign: 'center' },]}>
                            {attraction.estimated_price_tier ? attraction.estimated_price_tier.replace(/_/g, ' ') : ''}
                        </Text>
                        <Text style={[styles.locationTag,{ backgroundColor: 'green', color: 'white' },{ textAlign: 'center' },]}>
                            {attraction.generic_location ? attraction.generic_location.replace(/_/g, ' ') : ''}
                        </Text>
                    </View>

                    <View style={styles.carouselContainer}>
                        <Carousel
                            data={imageList}
                            renderItem={renderCarouselItem}
                            sliderWidth={330}
                            itemWidth={330}
                            layout={'default'}
                            onSnapToItem={(index) => setImageActiveSlide(index)}
                        />
                        <Pagination
                            dotsLength={imageList.length} // Total number of items
                            activeDotIndex={imageActiveSlide} // Current active slide index
                            containerStyle={{ paddingVertical: 10, marginTop: 5 }}
                            dotStyle={{
                                width: 7,
                                height: 7,
                                borderRadius: 5,
                                backgroundColor: 'rgba(0, 0, 0, 0.92)',
                            }}
                            inactiveDotOpacity={0.4}
                            inactiveDotScale={0.6}
                        />
                    </View>

                    <Text style={[styles.subtitle]}>{attraction.address}</Text>
                    <Text style={styles.description}>{attraction.description}</Text>

                    <Text style={{ fontSize: 12 }}>
                        <Text style={{ fontWeight: 'bold' }}>Operating Hours:</Text>{' '}
                        {attraction.opening_hours}
                    </Text>
                    <Text style={{ fontSize: 12 }}>
                        <Text style={{ fontWeight: 'bold' }}>Age Group:</Text>{' '}
                        {attraction.age_group}
                    </Text>

                    {seasonalActivity && <View style={{ backgroundColor: '#EBFAF2', marginTop: 10, padding: 8, borderRadius: 10 }}>
                        <Text style={styles.activityHeader} >Special Event !!</Text>
                        <Text style={styles.activity}>{seasonalActivity.name} from {seasonalActivity.start_date} to {seasonalActivity.end_date}</Text>
                        <Text style={styles.activity}>{seasonalActivity.description}</Text>
                    </View>}

                </Card>

                <Card containerStyle={styles.dropBorder}>
                    <Card.Title style={styles.header}>
                        Tickets
                    </Card.Title>

                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 340, height: 100, marginTop: -15 }}>
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
                            <View key={item.ticket_type} style={{ flexDirection: 'row', alignItems: 'center', width: 400, marginLeft: 8, marginBottom: 30 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: 130 }}>
                                    <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{`${item.ticket_type} TICKET @ $${item.amount}`}{'\n'}{`Tickets Available: ${item.ticket_count}`}  </Text>
                                </View>

                                <Button mode="contained" style={{ backgroundColor: '#044537', color: "white", marginLeft: 20 }} onPress={() => handleDecrease(item.ticket_type)}>
                                    -
                                </Button>

                                <Text style={{ marginLeft: 20 }}>{quantityByTicketType[item.ticket_type] || 0}</Text>

                                <Button mode="contained" style={{ backgroundColor: '#044537', color: "white", marginLeft: 20 }} onPress={() => handleIncrease(item.ticket_type)}>
                                    +
                                </Button>

                            </View>
                        ))}
                        {selectedDate != undefined && tours.length == 0 &&
                            <View style={{ backgroundColor: '#EBFAF2', padding: 8, borderRadius: 10 }}>
                                <Text style={styles.activityHeader}>
                                    No tours available on this date
                                </Text>
                            </View>
                        }
                        {selectedDate != undefined && tours.length > 0 &&
                            <View style={{ backgroundColor: '#EBFAF2', padding: 8, borderRadius: 10 }}>
                                <Text style={styles.activityHeader}>
                                    {tours.length} {tours.length === 1 ? 'tour' : 'tours'} available on this date
                                    <TouchableOpacity onPress={viewMoreTours}>
                                        <Text style={{
                                            color: 'blue',
                                            marginLeft: 80,
                                            fontSize: 14,
                                        }}>View Tours</Text>
                                    </TouchableOpacity>
                                </Text>
                            </View>
                        }
                    </View>
                </Card>

                <View style={styles.cartOut}>
                    <CartButton
                        style={styles.cartButton}
                        text="Add to Cart"
                        mode="contained"
                        onPress={addToCart}
                    />
                </View>

                <View>
                    {recommendation.length > 0 && (
                        <Card containerStyle={styles.dropBorder}>
                            <Card.Title style={styles.header}>
                                Nearby Recommendation
                            </Card.Title>

                            <ScrollView horizontal>
                                <View style={{ flexDirection: 'row', height: 350 }}>
                                    {
                                        recommendation.map((item, index) => (
                                            <TouchableOpacity key={index} onPress={() => handleItemClick(item)}>
                                                {item.listing_type === 'ATTRACTION' && (
                                                    <AttractionRecom item={item} />
                                                )}
                                                {item.listing_type === 'RESTAURANT' && (
                                                    <RestaurantRecom item={item} />
                                                )}
                                                {item.listing_type === 'ACCOMMODATION' && (
                                                    <AccommodationRecom item={item} />
                                                )}
                                            </TouchableOpacity>
                                        ))
                                    }
                                </View>
                            </ScrollView>
                        </Card>
                    )}
                </View>
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
    tagContainer: {
        flexDirection: 'row',
        justifyContent: 'left',
        marginBottom: 5,
    },
    typeTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 85,
        fontSize: 7,
        fontWeight: 'bold',
    },
    tierTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 50,
        fontSize: 8,
        fontWeight: 'bold',
    },
    locationTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 80,
        fontSize: 8,
        fontWeight: 'bold',
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
    },
    carouselContainer: {
        flex: 1,
        marginTop: 8,
        marginBottom: 10,
    },
    cardImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
});

export default AttractionDetailsScreen