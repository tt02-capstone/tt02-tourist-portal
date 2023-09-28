import React, { useState, useEffect, useCallback } from 'react'
import Background from '../../components/CardBackground'
import { Button } from 'react-native-paper';
import CartButton from '../../components/Button';
import { theme } from '../../core/theme'
import { getUser, getUserType, storeUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import { DatePickerModal } from 'react-native-paper-dates';
import { getAccommodation, getNumOfBookingsOnDate, getMinAvailableRoomsOnDateRange } from '../../redux/reduxAccommodation';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { cartApi } from '../../helpers/api';

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
    const { accommodationId } = route.params;

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
        const cartItems = [];
        const selectedRooms = [];
        const user_type = user.user_type;
        const user_email = user.email;
        const activity_name = accommodation.name;

        if (!startDate && !endDate) { // check if date is selected 
            Toast.show({
                type: 'error',
                text1: "Please Select a Booking Date!"
            })
        } else {
            // format date
            const checkInDate = new Date(range.startDate);
            checkInDate.setDate(checkInDate.getDate() + 1); // as datepicker is giving 1 day before
            const checkInDateInLocalDateTime = checkInDate.toISOString();

            const checkOutDate = new Date(range.endDate);
            checkOutDate.setDate(checkOutDate.getDate() + 1); // as datepicker is giving 1 day before
            const checkOutDateInLocalDateTime = checkOutDate.toISOString();

            for (const roomType in quantityByRoomType) {
                if (quantityByRoomType[roomType] > 0) {
                    cartItems.push({
                        type: "ACCOMMODATION",
                        activity_selection: roomType,
                        quantity: quantityByRoomType[roomType],
                        price: formattedRoomList.find(item => item.room_type === roomType).price, // price per ticket
                        start_datetime: formattedDate,
                        end_datetime: formattedDate,
                    });

                    // edit this chunk till 90, after editing the else block
                    selectedRooms.push({
                        ticket_per_day_id: formattedPriceList.find(item => item.ticket_type === roomType).ticket_type_id,
                        room_type: roomType,
                        ticket_date: formattedDate,
                        ticket_count: quantityByRoomType[roomType],
                        ticket_price: formattedPriceList.find(item => item.ticket_type === roomType).amount // price per ticket 
                    });

                }
            }

            if (selectedRooms.length === 0) { // when room date is selected but room type quantity are all 0
                Toast.show({
                    type: 'error',
                    text1: "Please Select your Room Quantity!"
                })

                // haven't looked at this chunk
            } else {  // when both ticket date + ticket types are selected 
                let checkInventory = await checkTicketInventory(accommodation.accommodation_id, formattedDate, selectedRooms);
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
                    const response = await cartApi.post(`/addCartItems/${user_type}/${user_email}/${activity_name}`, cartItems);
                    console.log(response.data.httpStatusCode)
                    if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
                        Toast.show({
                            type: 'error',
                            text1: 'Unable to add items to cart'
                        });
                    } else {
                        console.log('success', response.data)
                        setSelectedDate(null); // must have = use this to reset date selection 
                        setQuantityByRoomType(0) // must have = reset the quantity as well to 0 
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
            const amenities_description = room.amenities_description;
            const num_of_pax = room.num_of_pax;
            const price = room.price;
            const roomCount = room.quantity;

            let available_rooms = 0;

            if (range.startDate && range.endDate) {
                console.log("range.startDate", range.startDate);
                console.log("range.endDate", range.endDate);

                const checkInDate = new Date(range.startDate);
                checkInDate.setDate(checkInDate.getDate() + 1); // as datepicker is giving 1 day before
                const checkInDateInLocalDateTime = checkInDate.toISOString();
    
                const checkOutDate = new Date(range.endDate);
                checkOutDate.setDate(checkOutDate.getDate() + 1); // as datepicker is giving 1 day before
                const checkOutDateInLocalDateTime = checkOutDate.toISOString();

                // console.log("selectedDateInLocalDateTime", selectedDateInLocalDateTime);
                // console.log ("accommodation.accommodation_id", accommodation.accommodation_id);
                // console.log ("room.room_type", room.room_type);

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



    useEffect(() => {
        fetchAccommodation(); // when the page load the first time
        fetchRoom();
    }, [range]);

    const onDismiss = useCallback(() => {
        setOpen(false);
      }, [setOpen]);
    
     const onConfirm = useCallback(
        ({ startDate, endDate }) => {
          setOpen(false);
          setRange({ startDate, endDate });
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

    return (
        <Background>
            <ScrollView>
                <Card>
                    <Card.Title style={styles.header}>
                        {accommodation.name}
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

                <Card containerStyle={styles.dropBorder}>
                    <Card.Title style={styles.header}>
                        Rooms
                    </Card.Title>

                    {/* <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 340, height: 100, marginTop: -15 }}>
                        <DatePickerInput
                            locale='en-GB'
                            format
                            label="Room Booking Date"
                            value={selectedDate}
                            onChange={(d) => setSelectedDate(d)}
                            inputMode="start"
                        />
                    </View> */}


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

                                <Button mode="contained" style={{ backgroundColor: '#044537', color: "white", marginLeft: 20 }} onPress={() => handleIncrease(item.room_type)}>
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