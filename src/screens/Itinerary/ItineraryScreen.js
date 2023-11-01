import React, { useState, useEffect } from 'react'
import { theme } from '../../core/theme'
import Button from '../../components/Button'
import { View, ScrollView, StyleSheet, Modal, Alert, Pressable, TouchableOpacity } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getItineraryByUser, createItinerary, updateItinerary, deleteItinerary } from '../../redux/itineraryRedux';
import { getAllDiyEventsByDay, deleteDiyEvent } from '../../redux/diyEventRedux';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from "@react-navigation/native";
import { DatePickerModal } from 'react-native-paper-dates';
import CreateItineraryScreen from './CreateItineraryScreen';
import { IconButton } from 'react-native-paper';
import Toast from "react-native-toast-message";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import moment from 'moment';

const ItineraryScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const isFocused = useIsFocused();
    const [range, setRange] = useState({ startDate: undefined, endDate: undefined });
    const [open, setOpen] = useState(false);
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [index, setIndex] = useState(0);
    const [routes, setRoutes] = useState([]);
    const [firstDayDiyEvents, setFirstDayDiyEvents] = useState([]);
    const [currentDiyEvents, setCurrentDiyEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    // diy event modal
    const [showDiyModal, setShowDiyModal] = useState(false);
    const [diyObject, setDiyObject] = useState(undefined);

    useEffect(() => {
        onLoad();

        if (isFocused) {
            onLoad();
        }

    }, [isFocused]);

    async function onLoad() {
        const userData = await getUser();
        setUser(userData);
        const userId = userData.user_id;
        // console.log("userId", userId);

        let response = await getItineraryByUser(userId);
        if (response.status) {
            console.log("getItineraryByUser response.data", response.data)
            setItinerary(response.data);

            const numberOfDays = calculateNumberOfDays(response.data.start_date, response.data.end_date);
            const generatedRoutes = [];
            for (let i = 0; i < numberOfDays; i++) {
                generatedRoutes.push({ key: `${i + 1}`, title: `Day ${i + 1}` });
            }
            setRoutes(generatedRoutes);
            console.log("generatedRoutes", generatedRoutes);

            getFirstDayDiyEvents(response.data);
        } else {
            console.log('itinerary not created / fetched!');
        }
        setLoading(false);
    }

    async function getFirstDayDiyEvents(retrievedItinerary) {
        try {
            let response = await getAllDiyEventsByDay(retrievedItinerary.itinerary_id, 1);
            setFirstDayDiyEvents(response.data);
            setCurrentDiyEvents(response.data);
            // console.log("Day 1 Diy Events: ", response.data);
        } catch (error) {
            alert('An error occurred! Failed to retrieve first day diy events!');
        }
    }

    useEffect(() => {
    }, [firstDayDiyEvents, currentDiyEvents, itinerary]);

    // Function to calculate the number of days between two dates
    const calculateNumberOfDays = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDifference = end - start;
        const daysDifference = timeDifference / (1000 * 3600 * 24);
        return Math.floor(daysDifference) + 1;
    };

    const handleDeleteItineraryPress = (itineraryId) => {

        // console.log("itineraryId", itineraryId);

        Alert.alert(
            "Delete Confirmation",
            "Are you sure you want to delete this itinerary?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Delete Cancelled"),
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: () => handleDeleteItinerary(user.user_id, itineraryId)
                }
            ],
            { cancelable: false }
        );
    };

    async function handleDeleteItinerary(userId, itineraryId) {

        // console.log("userId", userId);
        // console.log("ItineraryId", itineraryId);

        let response = await deleteItinerary(userId, itineraryId);

        if (response.status) {

            Toast.show({
                type: 'success',
                text1: 'Itinerary deleted!'
            })

            setItinerary(null);

        } else {
            console.log("Itinerary deletion failed!");
            console.log(response.data);
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }

    const calculateTabWidth = () => {
        return routes.length <= 4 ? 390 / routes.length : 87;
    };

    const handleTabChange = async (newIndex) => {
        console.log("Selected day:", newIndex + 1);
        setIndex(newIndex);

        const dateSelected = moment(itinerary.start_date).add(newIndex, 'days').format('YYYY-MM-DD');
        setSelectedDate(dateSelected);

        try {
            let response = await getAllDiyEventsByDay(itinerary.itinerary_id, newIndex + 1);
            setCurrentDiyEvents(response.data);
            // console.log("Day ", newIndex+1, " Diy Events: ", response.data);
        } catch (error) {
            alert('An error occurred! Failed to retrieve itinerary!');
        }
    };

    const navigateFunction = (event) => {
        if (event.attraction !== null) {
            navigation.navigate('AttractionDetailsScreen', { attractionId: event.attraction.attraction_id });
        } else if (event.telecom !== null) {
            navigation.navigate('TelecomDetailsScreen', { id: event.telecom.telecom_id });
        } else if (event.accommodation !== null) {
            navigation.navigate('AccommodationDetailsScreen', { accommodationId: event.accommodation.accommodation_id });
        } else if (event.restaurant !== null) {
            navigation.navigate('RestaurantDetailsScreen', { restId: event.restaurant.restaurant_id });
        } else if (event.booking !== null) {
            navigation.navigate('BookingDetailsScreen', { bookingId: event.booking.booking_id });
        } else { // DIY
            setDiyObject(event);
            setShowDiyModal(true);
        }
    }

    const handleDeleteDiyEventPress = (eventId) => {
        Alert.alert(
            "Delete Confirmation",
            "Are you sure you want to delete this event?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Delete Cancelled"),
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: () => handleDeleteDiyEvent(eventId)
                }
            ],
            { cancelable: false }
        );
    };

    const handleEditDiyEventPress = (event) => {
        navigation.navigate('EditDIYEventScreen', { diyEventData: event });
    };

    const handleDeleteDiyEvent = async (eventId) => {
        let response = await deleteDiyEvent(eventId);
        if (response.status) {
            Toast.show({
                type: 'success',
                text1: 'Event deleted!'
            });

            const index = currentDiyEvents.findIndex(event => event.diy_event_id === eventId);
            if (index !== -1) {
                const updatedDiyEvents = [...currentDiyEvents];
                updatedDiyEvents.splice(index, 1);
                setCurrentDiyEvents(updatedDiyEvents);
            }
        } else {
            console.log("Event deletion failed!");
            console.log(response.data);
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            });
        }
    };

    const renderScene = ({ route }) => {
        // console.log("renderScene called with route key:", route.key);
        const dayNum = route.key === '1' ? 1 : parseInt(route.key.replace('day', ''));

        return (
            <ScrollView style={{ flex: 1 }}>
                {currentDiyEvents.length > 0 ? (
                    currentDiyEvents.map(event => (
                        <Card key={event.diy_event_id} style={styles.card}>
                            <Text>{event.name}</Text>
                            <Text>{moment(event.start_datetime).format('lll')}</Text>
                            <Text>{moment(event.end_datetime).format('lll')}</Text>
                            <Text>{event.location}</Text>
                            <Text>{event.remarks}</Text>
                            {event.attraction && <Text>Attraction: {event.attraction.attraction_id}</Text>}
                            {event.accommodation && <Text>Accommodation: {event.accommodation.accommodation_id}</Text>}
                            {event.telecom && <Text>Telecom: {event.telecom.telecom_id}</Text>}
                            {event.restaurant && <Text>Restaurant: {event.restaurant.restaurant_id}</Text>}
                            {event.booking && <Text>Booking: {event.booking.booking_id}</Text>}
                            {!event.attraction && !event.accommodation && !event.telecom && !event.restaurant && !event.booking && <Text>DIY: {event.diy_event_id}</Text>}
                            <Text onPress={() => navigateFunction(event)}>Go</Text>
                            {!event.booking && <IconButton
                                icon="delete"
                                size={20}
                                style={[styles.icon, styles.closeButton]}
                                onPress={() => handleDeleteDiyEventPress(event.diy_event_id)}
                            />}
                            <IconButton
                                icon="pencil"
                                size={20}
                                style={[styles.icon, styles.editButton]}
                                onPress={() => handleEditDiyEventPress(event)}
                            />
                        </Card>
                    ))
                ) : (
                    <Text>No events available for this day.</Text>
                )}
            </ScrollView>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {!itinerary && <Button text="Create Itinerary" style={styles.button} onPress={() => navigation.navigate('CreateItineraryScreen')} />}
            {!itinerary && <Text>No itinerary available</Text>}
            {itinerary && (
                <View>
                    <Text><Text style={{ fontWeight: 'bold' }}>Duration:</Text> {moment(itinerary.start_date).format('MMM Do')} - {moment(itinerary.end_date).format('MMM Do')}</Text>
                    <Text><Text style={{ fontWeight: 'bold' }}>Num of Pax:</Text> {itinerary.number_of_pax}</Text>
                    <Text><Text style={{ fontWeight: 'bold' }}>Remarks:</Text> {itinerary.remarks}</Text>
                </View>
            )}
            {itinerary && (
                <View style={styles.iconContainer}>
                    {itinerary && itinerary.diy_event_list && itinerary.diy_event_list.length === 0 && (
                        <IconButton
                            icon="pencil"
                            size={20}
                            style={styles.icon}
                            onPress={() => navigation.navigate('EditItineraryScreen', { itineraryId: itinerary.itinerary_id })}
                        />
                    )}
                    <IconButton
                        icon="delete"
                        size={20}
                        style={styles.icon}
                        onPress={() => handleDeleteItineraryPress(itinerary.itinerary_id)}
                    />
                </View>
            )}

            {itinerary && (
                <View style={{ flex: 1 }}>
                    <TabView
                        navigationState={{ index, routes }}
                        renderScene={renderScene}
                        onIndexChange={handleTabChange}
                        initialLayout={{ width: '100%' }}
                        scrollEnabled={true}
                        renderTabBar={props => (
                            <TabBar
                                {...props}
                                scrollEnabled={true}
                                tabStyle={{ width: calculateTabWidth() }}
                            />
                        )}
                    />
                </View>
            )}

            {/* View DIY Event Modal */}
            {showDiyModal && (<View style={styles.centeredView}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showDiyModal}
                    onRequestClose={() => {
                        setShowDiyModal(false);
                    }}
                >

                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>DIY Event {diyObject?.name}</Text>

                            <View>
                                <Text><Text style={{ fontWeight: 'bold' }}>Start date:</Text> {moment(diyObject?.start_datetime).format('LLL')}</Text>
                                <Text><Text style={{ fontWeight: 'bold' }}>End date:</Text> {moment(diyObject?.end_datetime).format('LLL')}</Text>
                                <Text><Text style={{ fontWeight: 'bold' }}>Location:</Text> {diyObject?.location}</Text>
                                <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Remarks:</Text>
                                <Text>{diyObject?.remarks}</Text>
                            </View>

                            <View style={{ marginLeft: 75, marginTop: 20 }}>
                                <Pressable
                                    style={[styles.modalButton, styles.buttonClose]}
                                    onPress={() => {
                                        setShowDiyModal(false);
                                        setDiyObject(undefined)
                                    }}>
                                    <Text style={styles.textStyle}>Close</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>)}

            {itinerary && (
                <View style={styles.addEventButtonContainer}>
                    <Button text="Add Event" style={styles.recommendationButton} onPress={() => navigation.navigate('CreateDIYEventScreen', { itinerary: itinerary })} />
                </View>
            )}
            {itinerary && (
                <View style={styles.buttonContainer}>
                    <Button
                        text="View Recommendations"
                        style={styles.recommendationButton}
                        onPress={() =>
                            navigation.navigate('ItineraryRecommendationsScreen', {
                                date: selectedDate ? selectedDate : itinerary.start_date.split('T')[0],
                                itineraryId: itinerary.itinerary_id,
                            })
                        }
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '40%',
        marginLeft: '30%',
        marginRight: '30%',
        backgroundColor: '#5f80e3'
    },
    addEventButtonContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 20,
    },
    recommendationButton: {
        width: '80%',
        backgroundColor: '#5f80e3',
        alignSelf: 'center',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginLeft: -5,
        marginTop: -5,
        marginRight: 3,
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
        borderRadius: 20,
        padding: 35,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 250,
        width: 350,
        marginTop: -100
    },
    modalButton: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginLeft: 10,
        marginRight: 10,
        width: 100,
        backgroundColor: '#044537',
    },
    buttonOpen: {
        backgroundColor: '#044537',
    },
    buttonClose: {
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
    dropBorder: {
        borderWidth: 0,
        shadowColor: 'rgba(0,0,0, 0.0)',
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        backgroundColor: theme.colors.surface,
    },
    closeButton: {
        position: 'absolute',
        top: 5,
        right: 5,
    },
    editButton: {
        position: 'absolute',
        top: 5,
        right: 50,
    },
});

export default ItineraryScreen
