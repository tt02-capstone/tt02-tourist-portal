import React, { useState, useEffect, useCallback } from 'react'
import Background from '../../components/CardBackground'
import { Button } from 'react-native-paper';
import CartButton from '../../components/Button';
import { theme } from '../../core/theme'
import { getUser, getUserType, storeUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
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
import { timeZoneOffset } from "../../helpers/DateFormat";
import AttractionRecom from '../Recommendation/AttractionRecom';
import RestaurantRecom from '../Recommendation/RestaurantRecom';
import AccommodationRecom from '../Recommendation/AccommodationRecom';
import { getRecommendation } from '../../redux/recommendationRedux';
import moment from 'moment';
import CreateAttractionDIYEventScreen from './CreateAccommodationDIYEventScreen';
import { getItineraryByUser } from '../../redux/itineraryRedux';

const AccommodationDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [accommodation, setAccommodation] = useState([]);
    const [roomList, setRoomList] = useState([]);
    const [imageList, setImageList] = useState([]);
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
    const [imageActiveSlide, setImageActiveSlide] = useState(0);

    // itinerary
    const [itinerary, setItinerary] = useState(null);
    const [showModal, setShowModal] = useState(false);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    async function fetchItinerary() {
        const response = await getItineraryByUser(user.user_id);
        if (response.status) {
            setItinerary(response.data);
        } else {
            console.log("itinerary not created / found!");
        }
    }

    useEffect(() => {
        if (user) {
            fetchItinerary()
        }
    }, [user])

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

            const checkInTime = accommodation.check_in_time.split('T')[1];
            const checkOutTime = accommodation.check_out_time.split('T')[1];

            const checkInDate = new Date(range.startDate);
            checkInDate.setHours(checkInDate.getHours() + timeZoneOffset);
            const checkInDateInLocalDateTime = `${checkInDate.toISOString().split('T')[0]}T${checkInTime}Z`;

            const checkOutDate = new Date(range.endDate);
            checkOutDate.setDate(checkOutDate.getDate());
            const checkOutDateInLocalDateTime = `${checkOutDate.toISOString().split('T')[0]}T${checkOutTime}Z`;

            const millisecondsInADay = 1000 * 60 * 60 * 24;
            const numOfNights = Math.ceil((checkOutDate - checkInDate) / millisecondsInADay) - 1;

            for (const roomType in quantityByRoomType) {

                console.log("roomType", roomType);

                if (quantityByRoomType[roomType] > 0) {

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
                        console.log("price for", room.room_type, ": ", formattedRoomList.find(item => item.room_type === room.room_type).price * numOfNights);

                        let cartBooking = {
                            activity_name: accommodation.name,
                            start_datetime: checkInDateInLocalDateTime,
                            end_datetime: checkOutDateInLocalDateTime,
                            type: 'ACCOMMODATION',
                            cart_item_list: [{
                                type: "ACCOMMODATION",
                                activity_selection: room.room_type,
                                quantity: room.quantity,
                                price: formattedRoomList.find(item => item.room_type === room.room_type).price * numOfNights,
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
            console.log("accommodation.accommodation_image_list", accommodation.accommodation_image_list);
            setRoomList(accommodation.room_list);
            setImageList(accommodation.accommodation_image_list);
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

            let available_rooms;

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
            const currentDate = new Date();

            if (startDate && endDate) {
                if (startDate < currentDate) {
                    setRange({ startDate: null, endDate: null });
                    onDismiss();
                    Toast.show({
                        type: 'error',
                        text1: 'You can only book for future dates.'
                    });
                } else {
                    setOpen(false);
                    setRange({ startDate, endDate });
                    const updatedQuantity = {};
                    formattedRoomList.forEach((item) => {
                        updatedQuantity[item.room_type] = 0;
                    });
                    setQuantityByRoomType(updatedQuantity);
                    console.log("quantityByRoomType", quantityByRoomType);
                }
            } else {
                setOpen(false);
                setRange({ startDate, endDate });
                onDismiss();
                Toast.show({
                    type: 'error',
                    text1: 'Both start and end dates must be selected.'
                });
            }
        },
        [setOpen, setRange, onDismiss, quantityByRoomType]
    );

    function formatLocalDateTime(localDateTimeString) {
        const dateTime = new Date(localDateTimeString);
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        return dateTime.toLocaleTimeString([], timeOptions);
    }

    function formatDatePicker(string) {
        const date = new Date(string);
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString([], dateOptions);
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
                if (user.accommodation_list[i].accommodation_id === accommodationId) {
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

    renderCarouselItem = ({ item }) => (
        <View>
            <Card.Image
                style={styles.cardImage}
                source={{ uri: item }}
            />
        </View>
    );

    const onItineraryPressed = () => {
        if (itinerary) {
            navigation.navigate('CreateAccommodationDIYEventScreen', { typeId: accommodation.accommodation_id, selectedAccommodation: accommodation });
        } else {
            setShowModal(true); // show cannot navigate modal
        }
    }

    return (
        <Background>
            <ScrollView>
                <Card>
                    <Card.Title style={styles.header}>
                        {accommodation.name}
                        <Button mode="text" style={{ marginTop: -15, marginRight: -20 }} onPress={save} >
                            {isSaved && <Icon name="heart" size={20} color='red' />}
                            {!isSaved && <Icon name="heart" size={20} color='grey' />}
                        </Button>
                        <Button mode="text" style={{ marginTop: -15, marginLeft: -5 }} onPress={onItineraryPressed} >
                            <Icon name="calendar" size={20} color='grey' />
                        </Button>
                    </Card.Title>

                    <View style={styles.tagContainer}>
                        <Text style={[styles.tag, { backgroundColor: getColorForType(accommodation.type), textAlign: 'center' }]}>{accommodation.type}</Text>
                        <Text style={[styles.tag, { backgroundColor: 'purple', color: 'white', textAlign: 'center' }]}>{accommodation.estimated_price_tier ? accommodation.estimated_price_tier.replace(/_/g, ' ') : ''}</Text>
                        <Text style={[styles.locationTag, { backgroundColor: 'green', color: 'white', textAlign: 'center' }]}>{accommodation.generic_location ? accommodation.generic_location.replace(/_/g, ' ') : ''}</Text>
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

                    <Text style={[styles.subtitle]}>{accommodation.address}</Text>
                    <Text style={styles.description}>{accommodation.description}</Text>
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
                                    <Card.Title style={styles.header}>{item.room_type.replace(/_/g, ' ')}</Card.Title>
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
                        width: 7,
                        height: 7,
                        borderRadius: 5,
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
                            {range.startDate && range.endDate ? `${formatDatePicker(range.startDate)} - ${formatDatePicker(range.endDate)}` : 'Pick range'}
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
                                        {`${item.room_type.replace(/_/g, ' ')} ROOM @ $${item.price}`}{'\n'}
                                        {`Rooms Available: ${Math.max(item.available_rooms >= 0 ? item.available_rooms : 0)}`}
                                    </Text>
                                </View>

                                {/* Check for no range selected */}
                                {range.startDate === undefined && range.endDate === undefined ? (
                                    <View style={{ marginLeft: 45 }}>
                                        <Text style={{ color: "#8c8c8c" }}>Select a date range</Text>
                                    </View>
                                ) : (
                                    // Check for available rooms
                                    item.available_rooms > 0 ? (
                                        <>
                                            <Button
                                                mode="contained"
                                                style={{ backgroundColor: '#044537', color: "white", marginLeft: 20 }}
                                                onPress={() => handleDecrease(item.room_type)}
                                                disabled={(item.available_rooms <= 0 || quantityByRoomType[item.room_type] == 0)}
                                            >
                                                {item.available_rooms > 0 && (quantityByRoomType[item.room_type] === 0 || !quantityByRoomType[item.room_type]) ? '\u00A0' : '-'}
                                            </Button>

                                            <Text style={{ marginLeft: 20 }}>{quantityByRoomType[item.room_type] || 0}</Text>

                                            <Button
                                                mode="contained"
                                                style={{ backgroundColor: '#044537', color: "white", marginLeft: 20 }}
                                                onPress={() => handleIncrease(item.room_type)}
                                                disabled={(quantityByRoomType[item.room_type] || 0) >= (item.available_rooms || 0)}
                                            >
                                                +
                                            </Button>
                                        </>
                                    ) : (
                                        <View style={{ marginLeft: 45 }}>
                                            <Text style={{ color: "#8c8c8c" }}>No rooms available</Text>
                                        </View>
                                    )
                                )}

                                {/* simplified code in which buttons aren't disabled, if want to align w the other pages */}
                                {/* <Button
                                    mode="contained"
                                    style={{ backgroundColor: '#044537', color: "white", marginLeft: 20 }}
                                    onPress={() => handleDecrease(item.room_type)}
                                >
                                    -
                                </Button>

                                <Text style={{ marginLeft: 20 }}>{quantityByRoomType[item.room_type] || 0}</Text>

                                <Button
                                    mode="contained"
                                    style={{ backgroundColor: '#044537', color: 'white', marginLeft: 20 }}
                                    onPress={() => {
                                        if ((quantityByRoomType[item.room_type] || 0) < (item.available_rooms || 0)) {
                                            handleIncrease(item.room_type);
                                        }
                                    }}
                                >
                                    +
                                </Button> */}
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
                    {recommendation.length > 0 && (
                        <Card containerStyle={styles.dropBorder}>
                            <Card.Title style={styles.header}>
                                Nearby Recommendations
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

                <View style={styles.centeredView}>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={showModal}
                            onRequestClose={() => {
                                setShowModal(false);
                            }}
                        >

                        <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <Text style={styles.modalText}>You have not created an itinerary!</Text>
                                    <Text style={styles.modalText}>Please create one before adding!</Text>

                                    <View style={{flexDirection: 'row'}}>
                                        <Pressable style={styles.modalButton} onPress={() => { setShowModal(false); navigation.navigate('CreateItineraryScreen');}}>
                                            <Text style={styles.textStyle}>Create</Text>
                                        </Pressable>
                                        <Pressable style={styles.modalButton} onPress={() => { setShowModal(false); }}>
                                            <Text style={styles.textStyle}>Close</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </Modal>
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
    cardImage: {
        padding: 0,
        marginBottom: 10,
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
    locationTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 120,
        fontSize: 11,
        fontWeight: 'bold',
    },
    tagContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
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
    },
    carouselContainer: {
        flex: 1,
        marginTop: 2,
        marginBottom: 10,
    },
    cardImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    button: {
        width: '40%',
        marginLeft: '30%',
        marginRight: '30%',
        backgroundColor: '#5f80e3',
        color: 'black'
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 160,
        width: 300,
        marginTop: -100
    },
    modalButton: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        marginLeft: 5,
        marginRight: 10,
        backgroundColor: '#044537',
        marginTop: 3,
        height: 38,
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
    },
    buttonOpen: {
        backgroundColor: '#044537',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});

export default AccommodationDetailsScreen