import React, { useState, useEffect, useCallback } from 'react'
import Background from '../../components/CardBackground'
import { Button } from 'react-native-paper';
import CartButton from '../../components/Button';
import { theme } from '../../core/theme'
import { getUser, getUserType, storeUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Card } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import { DatePickerModal } from 'react-native-paper-dates';
import { getAccommodation, getMinAvailableRoomsOnDateRange, toggleSaveAccommodation } from '../../redux/reduxAccommodation';
import { DatePickerInput } from 'react-native-paper-dates';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { cartApi } from '../../helpers/api';
import { addRoomToCart } from '../../redux/cartRedux';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import {timeZoneOffset} from "../../helpers/DateFormat";
import AttractionRecom from '../Recommendation/AttractionRecom';
import RestaurantRecom from '../Recommendation/RestaurantRecom';
import AccommodationRecom from '../Recommendation/AccommodationRecom';
import { getRecommendation } from '../../redux/recommendationRedux';

const AccommodationDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [accommodation, setAccommodation] = useState([]);
    const [roomList, setRoomList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState({ startDate: undefined, endDate: undefined });
    const [open, setOpen] = useState(false);
    const [formattedRoomList, setFormattedRoomList] = useState([]);
    const [quantityByRoomType, setQuantityByRoomType] = useState({});
    const route = useRoute();
    const [isSaved, setIsSaved] = useState(false);
    const [recommendation, setRecommendation] = useState([]);

    const { accommodationId } = route.params;
    const [activeSlide, setActiveSlide] = useState(0);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)

        const usertype = await getUserType()
    }

    const handleIncrease = (roomType) => {
        setQuantityByRoomType((prevQuantity) => {
            const updatedQuantity = {
                ...prevQuantity,
                [roomType]: (prevQuantity[roomType] || 0) + 1,
            };
            return updatedQuantity;
        });
    };

    const handleDecrease = (roomType) => {
        setQuantityByRoomType((prevQuantity) => {
            const updatedQuantity = {
                ...prevQuantity,
                [roomType]: Math.max((prevQuantity[roomType] || 0) - 1, 0),
            };
            return updatedQuantity;
        });
    };

    const handleDateRangeChange = (newDateRange) => {
        setRange(newDateRange);
    };


    const addToCart = async () => {
        const cartBookings = [];
        const cartItems = [];
        const selectedRooms = [];

        if (!range.startDate && !range.endDate) {
            Toast.show({
                type: 'error',
                text1: "Please Select a Booking Date!"
            })
        } else {
            // format date
            // const checkInDate = new Date(range.startDate);
            // checkInDate.setDate(checkInDate.getDate() + 1); // as datepicker is giving 1 day before
            // const checkInDateInLocalDateTime = checkInDate.toISOString();

            // const checkOutDate = new Date(range.endDate);
            // checkOutDate.setDate(checkOutDate.getDate()); // as datepicker is giving 1 day before
            // const checkOutDateInLocalDateTime = checkOutDate.toISOString();

            // console.log("checkInDateInLocalDateTime", checkInDateInLocalDateTime);
            // console.log("checkOutDateInLocalDateTime", checkOutDateInLocalDateTime);

            const checkInTime = accommodation.check_in_time.split('T')[1];
            const checkOutTime = accommodation.check_out_time.split('T')[1];

            console.log("checkInTime", checkInTime);
            console.log("checkOutTime", checkOutTime);

            const checkInDate = new Date(range.startDate);
            checkInDate.setHours(checkInDate.getHours() + timeZoneOffset);
            // checkInDate.setDate(checkInDate.getDate() + 1); // as datepicker is giving 1 day before
            const checkInDateInLocalDateTime = `${checkInDate.toISOString().split('T')[0]}T${checkInTime}Z`;

            const checkOutDate = new Date(range.endDate);
            checkOutDate.setDate(checkOutDate.getDate());
            const checkOutDateInLocalDateTime = `${checkOutDate.toISOString().split('T')[0]}T${checkOutTime}Z`;

            console.log("ADDTOCART checkInDateInLocalDateTime", checkInDateInLocalDateTime);
            console.log("ADDTOCART checkOutDateInLocalDateTime", checkOutDateInLocalDateTime);

            for (const roomType in quantityByRoomType) {

                console.log("roomType", roomType);

                if (quantityByRoomType[roomType] > 0) {

                    // removed as i don't use smthg similar to checkTicketInventory
                    // for ticket, this was ticket type entity
                    selectedRooms.push({
                        // this is undefined
                        room_id: formattedRoomList.find(item => item.room_type === roomType).room_id,
                        // amenities description
                        // num of pax
                        //ticket_price: formattedPriceList.find(item => item.ticket_type === roomType).amount // price per ticket
                        room_type: roomType,
                        quantity: quantityByRoomType[roomType],
                    });

                }
            }

            console.log("cartBookings", cartBookings);
            console.log("selectedRooms", selectedRooms);

            if (selectedRooms.length === 0) { // when room date is selected but room type quantity are all 0
                Toast.show({
                    type: 'error',
                    text1: "Please Select your Room Quantity!"
                })


            } else {  // when both ticket date + ticket types are selected

                // current date check
                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                const dateNow = `${year}-${month}-${day}`;

                if (dateNow > checkInDate) { // check for date selected since UI cant block dates before tdy
                    Toast.show({
                        type: 'error',
                        text1: 'Please select a future date!'
                    })
                } else {

                    for (const room of selectedRooms) {
                        let cartBooking = {
                            activity_name: accommodation.name,
                            start_datetime: checkInDateInLocalDateTime,
                            end_datetime: checkOutDateInLocalDateTime,
                            type: 'ACCOMMODATION',
                            cart_item_list: [{
                                type: "ACCOMMODATION",
                                activity_selection: room.room_type,
                                quantity: room.quantity,
                                price: formattedRoomList.find(item => item.room_type === room.room_type).price,
                                start_datetime: checkInDate,
                                end_datetime: checkOutDate,
                            }],
                        };

                        // room.room_id is undefined!!
                        console.log("room.room_id", room.room_id);
                        console.log("cartBooking", cartBooking);

                        // Call addRoomToCart for each room
                        let response = await addRoomToCart(user.user_id, room.room_id, cartBooking);
                        if (response.status) {
                            setQuantityByRoomType(0);
                            setRange({ startDate: undefined, endDate: undefined });
                            Toast.show({
                                type: 'success',
                                text1: 'Room has been added to cart!'
                            });
                        } else {
                            console.log("Room was not added to cart!");
                            console.log(response.data);
                            Toast.show({
                                type: 'error',
                                text1: response.data.errorMessage,
                            });
                        }
                    }
                }
            }
        };
    }

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
            console.log("roomList", accommodation.room_list);

            // for recommendations 
            let recoms = await getRecommendation(accommodation.generic_location, accommodation.listing_type, accommodationId);
            if (recoms.status) {
                setRecommendation(recoms.data);
            }

            setLoading(false);
            fetchUser();
        } catch (error) {
            console.log("error", error)
            alert('An error occurred! Failed to retrieve accommodation list!');
            setLoading(false);
        }
    }

    const fetchRoom = async () => {
        const formattedRoomList = await Promise.all(roomList.map(async (room) => {
            const room_id = room.room_id;
            const amenities_description = room.amenities_description;
            const num_of_pax = room.num_of_pax;
            const price = room.price;
            const roomCount = room.quantity;

            let available_rooms = 0;

            console.log("accommodation.check_in_time", accommodation.check_in_time);
            const checkInTime = accommodation.check_in_time.split('T')[1];
            const checkOutTime = accommodation.check_out_time.split('T')[1];

            console.log("checkInTime", checkInTime);
            console.log("checkOutTime", checkOutTime);

            if (range.startDate && range.endDate) {
                console.log("range.startDate", range.startDate);
                console.log("range.endDate", range.endDate);

                const checkInDate = new Date(range.startDate);
                checkInDate.setHours(checkInDate.getHours() + timeZoneOffset);
                // checkInDate.setDate(checkInDate.getDate() + 1); // as datepicker is giving 1 day before
                const checkInDateInLocalDateTime = `${checkInDate.toISOString().split('T')[0]}T${checkInTime}Z`;

                const checkOutDate = new Date(range.endDate);
                checkOutDate.setDate(checkOutDate.getDate());
                const checkOutDateInLocalDateTime = `${checkOutDate.toISOString().split('T')[0]}T${checkOutTime}Z`;

                console.log("HERE checkInDateInLocalDateTime", checkInDateInLocalDateTime);
                console.log("HERE checkOutDateInLocalDateTime", checkOutDateInLocalDateTime);

                try {
                    const response = await getMinAvailableRoomsOnDateRange(accommodation.accommodation_id, room.room_type, checkInDateInLocalDateTime, checkOutDateInLocalDateTime);
                    console.log("response", response);
                    available_rooms = response;
                    console.log("available_rooms", available_rooms);
                } catch (error) {
                    console.error("Error fetching available_rooms:", error);
                }
            }

            //   console.log("available_rooms", available_rooms);
            //   console.log("roomCount", roomCount);

            return {
                room_id,
                room_type: room.room_type,
                amenities_description,
                num_of_pax,
                price,
                roomCount,
                available_rooms,
            };
        }));

        console.log("formattedRoomList", formattedRoomList);
        setFormattedRoomList(formattedRoomList);
    };

    const renderRoomType = ({ item }) => {
        return (
            <View style={styles.roomTypeContainer}>
                <Text style={styles.roomTypeName}>{item.room_type}</Text>
                <Text style={styles.roomTypeDescription}>
                    {item.amenities_description} | {item.num_of_pax} guests
                </Text>
                <Text style={styles.roomTypePrice}>Price: ${item.price}</Text>
                <Text style={styles.roomTypeAvailability}>
                    Available: {item.available_rooms || 0}
                </Text>
            </View>
        );
    };

    useEffect(() => {
        fetchAccommodation(); // when the page load the first time
        fetchRoom();
    }, [range]);

    const onDismiss = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const onConfirm = useCallback(
        ({ startDate, endDate }) => {
            if (startDate && endDate) {
                setOpen(false);
                setRange({ startDate, endDate });
            } else {
                onDismiss();
                Toast.show({
                    type: 'error',
                    text1: 'Both start and end dates must be selected.'
                })
            }
        },
        [setOpen, setRange]
    );

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

                <Carousel
                    data={roomList}
                    renderItem={({ item }) => (
                        <Card containerStyle={styles.roomCard}>
                            <View style={{ flexDirection: 'row' }}>
                                <Image
                                    source={{ uri: item.room_image }}
                                    style={styles.roomImage}
                                />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Card.Title style={styles.header}>{item.room_type}</Card.Title>
                                    <Text style={styles.details}>
                                        <Text style={styles.boldText}>Amenities:</Text>{' '}
                                        {item.amenities_description}
                                    </Text>
                                    <Text style={styles.details}>
                                        <Text style={styles.boldText}>Pax Capacity:</Text>{' '}
                                        {item.num_of_pax}
                                    </Text>
                                    <Text style={styles.details}>
                                        <Text style={styles.boldText}>Price per Night:</Text>{' '}
                                        ${item.price}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    )}
                    sliderWidth={400}
                    itemWidth={360}
                    layout={'default'}
                    onSnapToItem={(index) => setActiveSlide(index)}
                />

                <Pagination
                    dotsLength={roomList.length} // Total number of items
                    activeDotIndex={activeSlide} // Current active slide index
                    containerStyle={{ paddingVertical: 10 }}
                    dotStyle={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        marginHorizontal: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.92)',
                    }}
                    inactiveDotOpacity={0.4}
                    inactiveDotScale={0.6}
                />

                <Card containerStyle={styles.dropBorder}>
                    <Card.Title style={styles.header}>
                        Book a Room
                    </Card.Title>

                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 340, height: 100, marginTop: -15 }}>
                        <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
                            Pick range
                        </Button>
                        <DatePickerModal
                            locale='en-GB'
                            mode="range"
                            format
                            label="Room Booking Date Range"
                            visible={open}
                            startDate={range.startDate}
                            endDate={range.endDate}
                            onConfirm={onConfirm}
                            onDismiss={onDismiss}
                            inputMode="start"
                        />
                    </View>

                    <View>
                        {formattedRoomList.map((item) => (
                            <View key={item.room_type} style={{ flexDirection: 'row', alignItems: 'center', width: 400, marginLeft: 10, marginBottom: 30 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: 120 }}>
                                    <Text style={{ fontSize: 11, fontWeight: 'bold' }}>
                                        {`${item.room_type} ROOM @ $${item.price}`}{'\n'}
                                        {`Rooms Available: ${item.available_rooms || 0}`}
                                    </Text>
                                </View>

                                <Button mode="contained" style={{ backgroundColor: '#044537', color: "white", marginLeft: 20 }} onPress={() => handleDecrease(item.room_type)}>
                                    -
                                </Button>

                                <Text style={{ marginLeft: 20 }}>{quantityByRoomType[item.room_type] || 0}</Text>

                                <Button
                                    mode="contained"
                                    style={{ backgroundColor: '#044537', color: "white", marginLeft: 20 }}
                                    onPress={() => handleIncrease(item.room_type)}
                                    disabled={item.available_rooms <= 0 || (quantityByRoomType[item.room_type] || 0) >= (item.available_rooms || 0)}
                                >
                                    +
                                </Button>
                            </View>
                        ))}
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

                {/* to view recommendations */}
                <View> 
                    { recommendation.length > 0 && (
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
    Card: {
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
    roomImage: {
        width: 100, height: 100, marginRight: 10,
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
    },
    roomCard: {
        margin: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 10,
    }

});

export default AccommodationDetailsScreen