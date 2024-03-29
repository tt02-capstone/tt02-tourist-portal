import React, { useState, useEffect } from 'react'
import { useIsFocused } from "@react-navigation/native";
import Background from '../../components/CardBackground'
import { Button } from 'react-native-paper';
import CartButton from '../../components/Button';
import { theme } from '../../core/theme'
import { getUser, storeUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, Modal, Pressable } from 'react-native';
import { Text, Card } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import { DatePickerInput } from 'react-native-paper-dates';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { getTelecomById, toggleSaveTelecom } from '../../redux/telecomRedux';
import { addTelecomToCart } from '../../redux/cartRedux';
import moment from 'moment-timezone';
import { timeZoneOffset } from "../../helpers/DateFormat";
import CreateTelecomDIYEventScreen from './CreateTelecomDIYEventScreen';
import { getItineraryByUser } from '../../redux/itineraryRedux';

const TelecomDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [telecom, setTelecom] = useState([]);
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();
    const [selectedDate, setSelectedDate] = useState();
    const [ticketQuantity, setTicketQuantity] = useState(0);

    const route = useRoute();
    const { id } = route.params;

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

    const fetchTelecom = async () => {
        let response = await getTelecomById(id);
        if (response.status) {
            setTelecom(response.data);
        } else {
            console.log("Telecom not fetched!");
        }
        setLoading(false);
    }

    useEffect(() => {
        if (isFocused) {
            setLoading(true);
            fetchUser();
            fetchTelecom();
        }
    }, [isFocused]);

    useEffect(() => {
        if (user) {
            let saved = false;
            for (var i = 0; i < user.telecom_list.length; i++) {
                if (user.telecom_list[i].telecom_id == id) {
                    saved = true;
                    break;
                }
            }
            setIsSaved(saved);

            fetchItinerary();
        }
    }, [user])

    // add to saved listing
    const save = async () => {
        let response = await toggleSaveTelecom(user.user_id, telecom.telecom_id);
        if (response.status) {
            if (!isSaved) {
                setIsSaved(true);
                let obj = {
                    ...user,
                    telecom_list: response.data
                }
                await storeUser(obj);
                fetchUser();
                Toast.show({
                    type: 'success',
                    text1: 'Telecom has been saved!'
                });
            } else {
                setIsSaved(false);
                let obj = {
                    ...user,
                    telecom_list: response.data
                }
                await storeUser(obj);
                fetchUser();
                Toast.show({
                    type: 'success',
                    text1: 'Telecom has been unsaved!'
                });
            }

        } else {
            Toast.show({
                type: 'error',
                text1: response.info
            })
        }
    }

    const handleIncrease = (prev) => {
        setTicketQuantity(prev + 1);
    };

    const handleDecrease = (prev) => {
        if (prev >= 1) {
            setTicketQuantity(prev - 1);
        }
    };

    const addToCart = async () => {

        if (ticketQuantity < 1) {
            Toast.show({
                type: 'error',
                text1: "Please purchase at least 1!"
            })
        } else if (!selectedDate) {
            Toast.show({
                type: 'error',
                text1: "Please select a date!"
            })
        } else if (selectedDate.getYear() == new Date().getYear() && selectedDate.getMonth() == new Date().getMonth() && selectedDate.getDate() < new Date().getDate()) {
            Toast.show({
                type: 'error',
                text1: "Please select a future date!"
            })
        } else if (!telecom) {
            Toast.show({
                type: 'error',
                text1: "Telecom not selected!"
            })

        } else {
            selectedDate.setHours(selectedDate.getHours() + timeZoneOffset);
            let endDate = new Date(selectedDate);
            endDate.setDate(endDate.getDate() + telecom.num_of_days_valid - 1);

            let cartBooking = {
                activity_name: telecom.name,
                start_datetime: selectedDate,
                end_datetime: endDate,
                type: 'TELECOM',
                cart_item_list: [ // cart item
                    {
                        start_datetime: selectedDate,
                        end_datetime: endDate,
                        quantity: ticketQuantity,
                        price: telecom.price,
                        activity_selection: telecom.name,
                        type: 'TELECOM'
                    }
                ],
            };

            let response = await addTelecomToCart(user.user_id, telecom.telecom_id, cartBooking);
            if (response.status) {
                setTicketQuantity(0);
                setSelectedDate(null);
                Toast.show({
                    type: 'success',
                    text1: 'Telecom has been added to cart!'
                });
            } else {
                console.log("Item was not added to cart!");
                console.log(response.data);
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage,
                });
            }
        }
    }

    const onItineraryPressed = () => {
        if (itinerary) {
            navigation.navigate('CreateTelecomDIYEventScreen', { typeId: telecom.telecom_id, selectedTelecom: telecom });
        } else {
            setShowModal(true); // show cannot navigate modal
        }
    }

    return (
        <Background>
            <ScrollView>
                <Card>
                    <Card.Title style={styles.header}>
                        {telecom.name}
                        <Button mode="text" style={{ marginTop: -10, marginRight: -10 }} onPress={save} >
                            {isSaved && <Icon name="heart" size={20} color='red' />}
                            {!isSaved && <Icon name="heart" size={20} color='grey' />}
                        </Button>
                        <Button mode="text" style={{ marginTop: -10 }} onPress={onItineraryPressed} >
                            <Icon name="calendar" size={20} color='grey' />
                        </Button>
                    </Card.Title>

                    <Card.Image
                        style={{ padding: 0, height: 200, marginBottom: 20 }}
                        source={{
                            uri: telecom.image
                        }}
                    />

                    <Text style={styles.subtitle}>
                        <Text style={{ fontWeight: 'bold' }}>Price: </Text><Text>${telecom.price}     </Text>
                        <Text style={{ fontWeight: 'bold' }}>Duration: </Text><Text>{telecom.num_of_days_valid} day(s)    </Text>
                        <Text style={{ fontWeight: 'bold' }}>Data Limit: </Text><Text>{telecom.data_limit}GB</Text>
                    </Text>

                    <Text style={styles.description}>{telecom.description}</Text>
                </Card>

                <Card containerStyle={styles.dropBorder}>
                    <Card.Title style={styles.header}>
                        Purchase
                    </Card.Title>

                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 340, height: 100, marginTop: -15 }}>
                        <DatePickerInput
                            locale='en-GB'
                            format
                            label="Usage Start Date"
                            value={selectedDate}
                            onChange={(d) => setSelectedDate(d)}
                            inputMode="start"
                        />
                    </View>

                    <View>
                        <View key={ticketQuantity} style={{ flexDirection: 'row', alignItems: 'center', width: 400, marginLeft: 10, marginBottom: 30 }}>
                            <Text style={{ fontSize: 20 }} >Quantity: </Text>
                            <Button mode="contained" style={{ backgroundColor: '#044537', color: "white", marginLeft: 20 }} onPress={() => handleDecrease(ticketQuantity)}>-</Button>
                            <Text style={{ fontSize: 15, marginLeft: 20 }}>{ticketQuantity ? ticketQuantity : 0}</Text>
                            <Button mode="contained" style={{ backgroundColor: '#044537', color: "white", marginLeft: 20 }} onPress={() => handleIncrease(ticketQuantity)}>+</Button>

                        </View>

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

                                <View style={{ flexDirection: 'row' }}>
                                    <Pressable style={styles.modalButton} onPress={() => { setShowModal(false); navigation.navigate('CreateItineraryScreen'); }}>
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
    rCard: {
        flex: 1,
        width: 320,
        height: 100,
        borderRadius: 4,
        margin: 2
    },
    header: {
        textAlign: 'left',
        fontSize: 20,
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
    itineraryButton: {
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

export default TelecomDetailsScreen