import React, { useState, useEffect } from 'react'
import Button from '../../components/Button'
import { View, ScrollView, StyleSheet, Modal, Alert, Pressable, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getItineraryByUser, deleteItinerary, removeUserFromItinerary, getProfileImageByIdList } from '../../redux/itineraryRedux';
import { getAllDiyEventsByDay, deleteDiyEvent, diyEventOverlap, diyEventBookingOverlap } from '../../redux/diyEventRedux';
import { getUser } from '../../helpers/LocalStorage';
import { useIsFocused } from "@react-navigation/native";
import { IconButton } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from "react-native-toast-message";
import { TabView, TabBar } from 'react-native-tab-view';
import moment from 'moment';

const ItineraryScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const isFocused = useIsFocused();
    const [itinerary, setItinerary] = useState(null);
    const [index, setIndex] = useState(0);
    const [routes, setRoutes] = useState([]);
    const [firstDayDiyEvents, setFirstDayDiyEvents] = useState([]);
    const [currentDiyEvents, setCurrentDiyEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [fetchItinerary, setFetchItinerary] = useState(true);
    
    // people involved in itinerary
    const [involvedUserImageList, setInvolvedUserImageList] = useState([]);

    // diy event overlap
    const [showMinorOverlap, setShowMinorOverlap] = useState(null);
    const [showMajorOverlap, setShowMajorOverlap] = useState(null);

    // diy event modal
    const [showDiyModal, setShowDiyModal] = useState(false);
    const [diyObject, setDiyObject] = useState(undefined);

    // add button
    const [showOptions, setShowOptions] = useState(false);
    const handleMainButtonPress = () => {
        setShowOptions(true);
    };
    const windowHeight = Dimensions.get('window').height;

    useEffect(() => {
        onLoad();

        if (isFocused || fetchItinerary) {
            onLoad();
        }

    }, [isFocused, fetchItinerary]);

    async function onLoad() {
        const userData = await getUser();
        setUser(userData);
        const userId = userData.user_id;
        // console.log("userId", userId);

        let response = await getItineraryByUser(userId);
        if (response.status) {
            // console.log("getItineraryByUser response.data", response.data)
            setItinerary(response.data);

            let userImageResponse = await getProfileImageByIdList(response.data.itinerary_id);
            if (userImageResponse.status) {
                setInvolvedUserImageList(userImageResponse.data);
            }

            let minorOverlapResponse = await diyEventOverlap(response.data.itinerary_id);
            if (minorOverlapResponse.status) {
                setShowMinorOverlap(minorOverlapResponse.data);
            }

            let majorOverlapResponse = await diyEventBookingOverlap(response.data.itinerary_id);
            if (majorOverlapResponse.status) {
                setShowMajorOverlap(majorOverlapResponse.data);
            }

            const startDate = moment(response.data.start_date);
            const endDate = moment(response.data.end_date);

            const numberOfDays = endDate.diff(startDate, 'days') + 1; // Include the end date
            const generatedRoutes = [];
            for (let i = 0; i < numberOfDays; i++) {
                const currentDate = startDate.clone().add(i, 'days');
                generatedRoutes.push({ key: `${i + 1}`, title: currentDate.format('MMM Do') });
            }
            setRoutes(generatedRoutes);
            // console.log("generatedRoutes", generatedRoutes);

            getFirstDayDiyEvents(response.data);

            setFetchItinerary(false);
        } else {
            console.log('itinerary not created / fetched!');
        }
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
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }

    const handleOptOutOfItineraryPress = (itineraryId) => {

        Alert.alert(
            "Opt Out Confirmation",
            "Are you sure you want to opt out of this itinerary?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Opt Out Cancelled"),
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: () => handleOptOutOfItinerary(itineraryId, user.user_id)
                }
            ],
            { cancelable: false }
        );
    };

    async function handleOptOutOfItinerary(itineraryId, userId) {

        let response = await removeUserFromItinerary(itineraryId, userId);

        if (response.status) {

            Toast.show({
                type: 'success',
                text1: 'Successfully opted out!'
            })

            navigation.reset({
                index: 2,
                routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'ItineraryScreen' }],
            });

        } else {
            console.log("Opt out failed!");
            // console.log(response.data);
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
        // console.log("Selected day:", newIndex + 1);
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
        navigation.navigate('EditDIYEventScreen', { diyEventData: event, currentItinerary: itinerary });
    };

    const handleDeleteDiyEvent = async (eventId) => {
        let response = await deleteDiyEvent(eventId);
        if (response.status) {
            Toast.show({
                type: 'success',
                text1: 'Event deleted!'
            });
            setFetchItinerary(true);

            const index = currentDiyEvents.findIndex(event => event.diy_event_id === eventId);
            if (index !== -1) {
                const updatedDiyEvents = [...currentDiyEvents];
                updatedDiyEvents.splice(index, 1);
                setCurrentDiyEvents(updatedDiyEvents);
            }
        } else {
            console.log("Event deletion failed!");
            // console.log(response.data);
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            });
        }
    };

    const checkIfSameDay = (dayNum, eventDate) => {
        let constFirstDay = new Date(itinerary.start_date).getDate();
        for (var i = 1; i < dayNum; i++) {
            constFirstDay++;
        }
        // console.log("event date:", new Date(eventDate).getDate());
        // console.log("selected date: ", constFirstDay);
        return new Date(eventDate).getDate() === constFirstDay;
    }

    const renderEventContent = (event, dayNum) => {
        const containerStyle = event.booking
            ? { borderWidth: 1.2, borderColor: 'darkgreen' }
            : { borderWidth: 0.8, borderColor: 'lightgreen' };

        if (event.accommodation || event.booking?.room) {

            const cardHeight = event.remarks ? { height: 90 } : { height: 60};

            return (
                <Card style={{ flex: 1 }} wrapperStyle={cardHeight} containerStyle={containerStyle}>
                    <View style={styles.rowContainer} key={event.diy_event_id}>
                        <View style={styles.cardContainer}>
                            <View style={{ justifyContent: 'center' }}>
                                <IconButton icon="bed" size={20} onPress={null} />
                            </View>
                            <View style={{ justifyContent: 'center' }}>
                                <Text style={{ fontWeight: 'bold' }}>{event.name}</Text>
                                {checkIfSameDay(dayNum, event.start_datetime) ? (<Text>Check In Time: {moment(event.start_datetime).format('LT')}</Text>) : (<Text>Check in on {moment(event.start_datetime).format('Do MMM')}</Text>)}
                                {checkIfSameDay(dayNum, event.end_datetime) ? (<Text>Check Out Time: {moment(event.end_datetime).format('LT')}</Text>) : (<Text>Check out on {moment(event.end_datetime).format('Do MMM')}</Text>)}
                                <Text>{event.location}</Text>
                                {event.remarks && <Text style={{ flexWrap: 'wrap', width: 150, marginTop: 10  }}>{event.remarks}</Text>}
                            </View>
                        </View>

                        <View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <IconButton
                                    icon="pencil"
                                    size={20}
                                    style={[styles.icon]}
                                    onPress={() => handleEditDiyEventPress(event)}
                                />

                                {!event.booking && <IconButton
                                    icon="delete"
                                    size={20}
                                    style={[styles.icon]}
                                    onPress={() => handleDeleteDiyEventPress(event.diy_event_id)}
                                />}

                                <IconButton
                                    icon="chevron-right"
                                    size={35}
                                    style={styles.arrowIcon}
                                    onPress={() => navigateFunction(event)}
                                />
                            </View>
                        </View>
                    </View>
                </Card>
            );
        } else if (event.telecom || event.booking?.telecom) {
            
            return (
                <Card style={{ flex: 1 }} wrapperStyle={{ height: 60 }} containerStyle={containerStyle}>
                    <View style={styles.rowContainer} key={event.diy_event_id}>
                        <View style={styles.cardContainer}>
                            <View style={{ justifyContent: 'center' }}>
                                <IconButton icon="sim" size={20} onPress={null} />
                            </View>
                            <View style={{ justifyContent: 'center' }}>
                                <Text style={{ fontWeight: 'bold' }}>{event.name} Telecom Package</Text>
                                {checkIfSameDay(dayNum, event.start_datetime) ? (<Text>Activation Time: {moment(event.start_datetime).format('LT')}</Text>) : (<Text>Activated on: {moment(event.start_datetime).format('Do MMM')}</Text>)}
                                {checkIfSameDay(dayNum, event.end_datetime) ? (<Text>Deactivation Time: {moment(event.end_datetime).format('LT')}</Text>) : (<Text>Deactivation Time: {moment(event.end_datetime).format('Do MMM')}</Text>)}
                                {event.remarks && <Text style={{ flexWrap: 'wrap', width: 150, marginTop: 10  }}>{event.remarks}</Text>}
                            </View>
                        </View>

                        <View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <IconButton
                                    icon="pencil"
                                    size={20}
                                    style={[styles.icon]}
                                    onPress={() => handleEditDiyEventPress(event)}
                                />

                                {!event.booking && <IconButton
                                    icon="delete"
                                    size={20}
                                    style={[styles.icon]}
                                    onPress={() => handleDeleteDiyEventPress(event.diy_event_id)}
                                />}

                                <IconButton
                                    icon="chevron-right"
                                    size={35}
                                    style={styles.arrowIcon}
                                    onPress={() => navigateFunction(event)}
                                />
                            </View>
                        </View>
                    </View>
                </Card>
            );
        } else {
            return (
                <Card style={{ flex: 1 }} containerStyle={containerStyle}>
                    <View style={styles.rowContainer} key={event.diy_event_id}>
                        <View style={styles.cardContainer}>
                            <View style={{ justifyContent: 'center' }}>
                                {event.restaurant && <IconButton icon="silverware-fork-knife" size={20} onPress={null} />}
                                {(event.attraction || event.booking?.attraction) && <IconButton icon="ticket-confirmation" size={20} onPress={null} />}
                                {(event.tourtype || event.booking?.tour) && <IconButton icon="human-greeting-variant" size={20} onPress={null} />}
                                {(event.attraction == null && event.accommodation == null && event.telecom == null && event.restaurant == null && event.booking == null) && <IconButton icon="calendar" size={20} onPress={null} />}
                            </View>
                            <View style={{ justifyContent: 'center'}}>
                                <Text style={{ fontWeight: 'bold' }}>{event.name}</Text>
                                <Text>{moment(event.start_datetime).format('LT')} - {moment(event.end_datetime).format('LT')}</Text>
                                <Text>{event.location}</Text>
                                {event.remarks && !event.booking && !event.telecom && !event.attraction && !event.accommodation && !event.restaurant && 
                                <Text style={{ flexWrap: 'wrap', width: 220, marginTop: 10 }}>{event.remarks}</Text>}
                            </View>
                        </View>

                        <View style={styles.chevronContainer}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <IconButton
                                    icon="pencil"
                                    size={20}
                                    style={[styles.icon]}
                                    onPress={() => handleEditDiyEventPress(event)}
                                />

                                {!event.booking && <IconButton
                                    icon="delete"
                                    size={20}
                                    style={[styles.icon]}
                                    onPress={() => handleDeleteDiyEventPress(event.diy_event_id)}
                                />}
                            </View>

                            <View style={{ alignItems: 'flex-end' }}>
                                <IconButton
                                    icon="chevron-right"
                                    size={35}
                                    style={[styles.icon, styles.chevronButton]}
                                    onPress={() => navigateFunction(event)}
                                />
                            </View>
                        </View>
                    </View>
                </Card>
            );
        }
    };

    const renderScene = ({ route }) => {
        const dayNum = route.key === '1' ? 1 : parseInt(route.key.replace('day', ''));

        // Separate events with event types "accommodation" from the rest
        const accommodationEvents = currentDiyEvents.filter(
            (event) => event.accommodation !== null || event.booking && event.booking.room !== null
        );

        // Separate events with event types "accommodation" and "telecom" from the rest
        const telecomEvents = currentDiyEvents.filter(
            (event) => event.telecom !== null || event.booking && event.booking.telecom !== null
        );

        // Sort the remaining events by start_datetime
        const sortedNonAccommodationTelecomEvents = currentDiyEvents
            .filter((event) => event.accommodation == null && event.telecom == null && event.booking?.room == null && event.booking?.telecom == null)
            .slice()
            .sort((a, b) => {
                const startTimeA = new Date(a.start_datetime).getTime();
                const startTimeB = new Date(b.start_datetime).getTime();
                return startTimeA - startTimeB;
            });

        // Combine both sorted event lists
        const sortedEvents = [...accommodationEvents, ...telecomEvents, ...sortedNonAccommodationTelecomEvents];

        return (
            <ScrollView style={{ flex: 1, marginBottom: 40 }}>
                {sortedEvents.length > 0 ? (
                    sortedEvents.map(event => (
                        <>
                            {renderEventContent(event, dayNum)}
                        </>
                    ))
                ) : (
                    <View style={{alignItems: 'center', alignContent: 'center', justifyContent: 'center'}}>
                        <Image
                            style={styles.noEventsImage}
                            source={{uri: 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/WithinSG_logo.png'}}
                        />
                        <Text style={{fontSize: 20, marginTop: 10, fontWeight: 'bold', color: '#044537'}}>No events scheduled today!</Text>
                    </View>
                )}
            </ScrollView>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {!itinerary ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ marginBottom: 5 }}>No itinerary available</Text>
                    <Button text="Create Itinerary" style={styles.button} onPress={() => navigation.navigate('CreateItineraryScreen')} />
                    <Button text="View Invitations" style={styles.button} onPress={() => navigation.navigate('ViewInvitationsScreen')} />
                </View>
            ) : (
                <>
                    <View>
                        {showMinorOverlap && showMinorOverlap.length > 1 && (
                            <View style={styles.minorOverlapTextContainer}>
                                <IconButton
                                    icon="alert-circle"
                                    size={20}
                                    iconColor={'#d47b15'}
                                    onPress={null}
                                />
                                <Text style={styles.minorOverlapText}>{showMinorOverlap}</Text>
                                <Ionicons name="close-outline" size={30} color='red' style={{marginRight: 10}} onPress={() => setShowMinorOverlap(false)}/>
                            </View>
                        )}
                        {showMajorOverlap && showMajorOverlap.length > 1 && (
                            <View style={styles.majorOverlapTextContainer}>
                                <IconButton
                                    icon="alert"
                                    size={20}
                                    iconColor={'crimson'}
                                    onPress={null}
                                />
                                <Text style={styles.majorOverlapText}>{showMajorOverlap}</Text>
                            </View>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: 10, marginTop: 10, marginBottom: 10, marginLeft: 10 }}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{ marginLeft: 5, marginRight: 10 }}>
                                {involvedUserImageList.length > 0 && involvedUserImageList.map((url, index) => (
                                    <Image
                                        style={{ marginTop: 0, marginBottom: -100, borderRadius: 40 / 2, minWidth: 35, minHeight: 40, marginLeft: index * 5}}
                                        source={{uri: url ? url : 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/default_profile.jpg'}}
                                    />
                                )) }
                            </View>

                            <View style={{ marginTop: 5 }}>
                                <Text><Text style={{ fontWeight: 'bold' }}>Duration:</Text> {moment(itinerary.start_date).format('MMM Do')} - {moment(itinerary.end_date).format('MMM Do')}</Text>
                                <Text><Text style={{ fontWeight: 'bold' }}>Recommended Pax:</Text> {itinerary.number_of_pax}</Text>
                                {itinerary?.remarks && <Text><Text style={{ fontWeight: 'bold' }}>Remarks:</Text> {itinerary.remarks}</Text>}
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 10 }}>
                            <IconButton icon="pencil" size={25} style={styles.icon} onPress={() => navigation.navigate('EditItineraryScreen', { itineraryId: itinerary.itinerary_id })} />
                            {itinerary.master_id == user.user_id && <IconButton icon="delete" size={25} style={styles.icon} onPress={() => handleDeleteItineraryPress(itinerary.itinerary_id)}/>}
                            {itinerary.master_id != user.user_id && <IconButton icon="close" size={25} style={styles.icon} onPress={() => handleOptOutOfItineraryPress(itinerary.itinerary_id)}/>}
                        </View>
                    </View >

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
                                    style={{ backgroundColor: '#5f80e3' }}
                                />
                            )}
                        />
                    </View>

                    {/* View DIY Event Modal */}
                    {showDiyModal && (
                        <View style={styles.centeredView}>
                            <Modal
                                style={{}}
                                animationType="slide"
                                transparent={true}
                                visible={showDiyModal}
                                onRequestClose={() => {
                                    setShowDiyModal(false);
                                }}
                            >
                                <View style={styles.centeredView}>
                                    <View style={styles.modalView}>
                                        <View style={{flexDirection: 'row'}}>
                                            <IconButton icon="calendar" size={20} onPress={null} />
                                            <Text style={styles.modalText}>{diyObject?.name}</Text>
                                        </View>

                                        <View>
                                            <Text><Text style={{ fontWeight: 'bold' }}>Start date:</Text> {moment(diyObject?.start_datetime).format('LLL')}</Text>
                                            <Text><Text style={{ fontWeight: 'bold' }}>End date: </Text> {moment(diyObject?.end_datetime).format('LLL')}</Text>
                                            <Text><Text style={{ fontWeight: 'bold' }}>Location:</Text> {diyObject?.location}</Text>
                                            {diyObject?.remarks && <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Remarks:</Text>}
                                            {diyObject?.remarks && <Text>{diyObject?.remarks}</Text>}
                                        </View>
                                        <View style={{ marginTop: 20 }}>
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
                        </View>
                    )
                    }

                    <TouchableOpacity style={styles.floatingButton} onPress={handleMainButtonPress}>
                        <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>

                    <Modal visible={showOptions} animationType="slide" transparent={true}>
                        <View style={styles.modalContainer}>
                            <View style={[styles.modalContent, { height: windowHeight * 0.45 }]}>
                                {itinerary.master_id === user.user_id && <Button
                                    text="Invite Friends"
                                    style={{ width: '90%' }}
                                    onPress={() => {
                                        setShowOptions(false);
                                        navigation.navigate('InviteFriendScreen', { itineraryId: itinerary.itinerary_id });
                                    }}
                                />}
                                <Button
                                    text="Create Event"
                                    style={{ width: '90%' }}
                                    onPress={() => {
                                        setShowOptions(false);
                                        navigation.navigate('CreateDIYEventScreen', { itinerary: itinerary });
                                    }}
                                />
                                <Button
                                    text="View All Recommendations"
                                    style={{ width: '90%' }}
                                    onPress={() => {
                                        setShowOptions(false);
                                        navigation.navigate('ItineraryRecommendationsScreen', {
                                            date: selectedDate ? selectedDate : itinerary.start_date.split('T')[0],
                                            itineraryId: itinerary.itinerary_id,
                                        });
                                    }}
                                />
                                <Button
                                    text="Get Recommendations by Time"
                                    style={{ width: '90%' }}
                                    onPress={() => {
                                        setShowOptions(false);
                                        navigation.navigate('EventSuggestionsScreen', {
                                            date: selectedDate ? selectedDate : itinerary.start_date.split('T')[0],
                                            itineraryId: itinerary.itinerary_id,
                                        });
                                    }}
                                />
                                <Button text="Cancel" style={{ width: '90%', backgroundColor: 'gray' }} onPress={() => setShowOptions(false)} />
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </View >
    );
}

const styles = StyleSheet.create({
    button: {
        width: '40%',
        marginLeft: '30%',
        marginRight: '30%',
        backgroundColor: '#5f80e3',
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
        backgroundColor: '#044537',
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
    arrowIcon: {
        marginLeft: -15,
        marginTop: -5,
        marginRight: -10,
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        width: '100%',
        padding: 20,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#044537',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        marginBottom: -700
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        marginTop: -700,
    },
    modalButton: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginLeft: 10,
        marginRight: 10,
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
        marginLeft: -7,
        marginTop: 15,
        marginBottom: 15,
        textAlign: 'center',
        color: '#044537',
        fontWeight: 'bold'
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    minorOverlapText: {
        flex: 1,
        fontWeight: 'bold',
        color: '#d47b15',
        marginRight: 20
    },
    minorOverlapTextContainer: {
        backgroundColor: 'papayawhip',
        padding: 4,
        borderRadius: 5,
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        paddingRight: 7,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    majorOverlapText: {
        flex: 1,
        fontWeight: 'bold',
        color: 'crimson',
    },
    majorOverlapTextContainer: {
        backgroundColor: 'mistyrose',
        padding: 4,
        borderRadius: 5,
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -10,
    },
    profileImageList: {
        marginTop: 0,
        marginBottom: -100,
        borderRadius: 40 / 2,
        minWidth: 40,
        minHeight: 40,
    },
    noEventsImage: {
        marginTop: 160,
        marginBottom: 20,
        borderRadius: 130 / 2,
        width: 130,
        height: 130,
    },
});

export default ItineraryScreen
