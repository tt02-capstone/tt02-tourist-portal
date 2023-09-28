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
import { getAccommodation, getNumOfBookingsOnDate } from '../../redux/reduxAccommodation';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { cartApi } from '../../helpers/api';

const AccommodationDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [accommodation, setAccommodation] = useState([]);
    const [roomList, setRoomList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState();
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
            console.log("roomList", accommodation.room_list);

            setLoading(false);
            fetchUser();
        } catch (error) {
            console.log("error", error)
            alert('An error occurred! Failed to retrieve accommodation list!');
            setLoading(false);
        }
    }

    // const fetchRoom = () => {
    //     // Initialize an object to store room counts by type
    //     const roomCounts = {};
    //     const existingBookingsForRoomTypeCount = 0;

    //     // Group rooms by room type using reduce
    //     const roomGroups = roomList.reduce((groups, room) => {
    //         const roomType = room.room_type;

    //         if (!groups[roomType]) {
    //             groups[roomType] = [];
    //         }

    //         groups[roomType].push(room);

    //         return groups;
    //     }, {});

    //     console.log("roomGroups", roomGroups);

    //     // Now roomGroups object contains rooms grouped by room type

    //     // Map the grouped rooms to create the formattedRoomList
    //     const formattedRoomList = Object.keys(roomGroups).map((roomType) => {
    //         const rooms = roomGroups[roomType];
    //         const amenities_description = rooms[0].amenities_description;
    //         const num_of_pax = rooms[0].num_of_pax;
    //         const price = rooms[0].price;
    //         const roomCount = rooms.length; // Count of rooms for the current room type

    //         let room_booking_count = 0;
    //         let room_type_id = null;

    //         if (selectedDate) {
    //             console.log("selectedDate", selectedDate);
    //             (async () => {
    //                 const date = new Date(selectedDate);
    //                 const selectedDateInLocalDateTime = date.toISOString();

    //                 try {
    //                     const response = await getNumOfBookingsOnDate(accommodation.accommodation_id, roomType, selectedDateInLocalDateTime);
    //                     room_booking_count = response;
    //                     console.log("roomBookingCount", room_booking_count);

    //                     //     // // Replace 'attrTicketList' with the appropriate list that contains ticket data
    //                     //     // const matchingTicket = attrTicketList.find((ticket) =>
    //                     //     //     ticket.ticket_type === ticket_type && ticket.ticket_date === formattedDate
    //                     //     // );

    //                     //     // if (matchingTicket) {
    //                     //     //     room_booking_count = matchingTicket.ticket_count;
    //                     //     //     room_type_id = matchingTicket ? matchingTicket.room_type_id : null;
    //                     //     // }

    //                 } catch (error) {
    //                     console.error("Error fetching room_booking_count:", error);
    //                 }
    //             })();
    //         }

    //         console.log("room_booking_count", room_booking_count);
    //         console.log("roomCount", roomCount);

    //         return {
    //             room_type: roomType,
    //             amenities_description,
    //             num_of_pax,
    //             price,
    //             roomCount,
    //             room_booking_count,
    //             // room_type_id, 
    //         };
    //     });

    //     console.log("formattedRoomList", formattedRoomList);
    //     setFormattedRoomList(formattedRoomList);
    // };

    const fetchRoom = async () => {
        // Initialize an object to store room counts by type
        const roomCounts = {};
        const existingBookingsForRoomTypeCount = 0;

        // Group rooms by room type using reduce
        const roomGroups = roomList.reduce((groups, room) => {
            const roomType = room.room_type;

            if (!groups[roomType]) {
                groups[roomType] = [];
            }

            groups[roomType].push(room);

            return groups;
        }, {});

        console.log("roomGroups", roomGroups);

        // Now roomGroups object contains rooms grouped by room type

        const formattedRoomList = [];

        // Create an async function to fetch room booking counts
        const fetchRoomBookingCount = async (roomType) => {
            const rooms = roomGroups[roomType];
            const amenities_description = rooms[0].amenities_description;
            const num_of_pax = rooms[0].num_of_pax;
            const price = rooms[0].price;
            const roomCount = rooms.length; // Count of rooms for the current room type

            let room_booking_count = 0;
            let room_type_id = null;

            if (selectedDate) {
                console.log("selectedDate", selectedDate);
                const date = new Date(selectedDate);
                date.setDate(date.getDate() + 1); // as datepicker is giving 1 day before
                const selectedDateInLocalDateTime = date.toISOString();
                console.log("selectedDateInLocalDateTime", selectedDateInLocalDateTime);


                try {
                    const response = await getNumOfBookingsOnDate(accommodation.accommodation_id, roomType, selectedDateInLocalDateTime);
                    room_booking_count = response;
                    console.log("roomBookingCount", room_booking_count);
                } catch (error) {
                    console.error("Error fetching room_booking_count:", error);
                }
            }

            console.log("room_booking_count", room_booking_count);
            console.log("roomCount", roomCount);

            formattedRoomList.push({
                room_type: roomType,
                amenities_description,
                num_of_pax,
                price,
                roomCount,
                room_booking_count,
            });
        };

        // Iterate through room types and await fetchRoomBookingCount for each
        for (const roomType of Object.keys(roomGroups)) {
            await fetchRoomBookingCount(roomType);
        }

        console.log("formattedRoomList", formattedRoomList);
        setFormattedRoomList(formattedRoomList);
    };


    useEffect(() => {
        fetchAccommodation(); // when the page load the first time
        fetchRoom();
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
                        {formattedRoomList.map((item) => (
                            <View key={item.room_type} style={{ flexDirection: 'row', alignItems: 'center', width: 400, marginLeft: 10, marginBottom: 30 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: 120 }}>
                                    <Text style={{ fontSize: 11, fontWeight: 'bold' }}>
                                        {`${item.room_type} ROOM @ $${item.price}`}{'\n'}
                                        {`Rooms Available: ${item.roomCount - (item.room_booking_count || 0)}`}
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

                {/* <View style={styles.cartOut}> 
                        <CartButton 
                            style = {styles.cartButton}
                            text = "Add to Cart" 
                            mode="contained" 
                            onPress={addToCart}
                        />
                    </View> */}

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