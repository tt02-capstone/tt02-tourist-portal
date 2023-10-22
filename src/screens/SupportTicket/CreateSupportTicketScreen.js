
import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import Header from '../../components/Header';
import TextInput from '../../components/TextInput';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, CheckBox, Tab, TabView } from '@rneui/themed';
import InputValidator from '../../helpers/InputValidator';
import { createSupportTicketToAdmin, createSupportTicketToVendor, createSupportTicketForBooking, getBookingHistoryList } from '../../redux/supportRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'
import RNPickerSelect from 'react-native-picker-select';
import { getPublishedDealList } from "../../redux/dealRedux";
import { getPublishedTelecomList } from "../../redux/telecomRedux";
import { getRestaurantList } from "../../redux/restaurantRedux";
import { getAccommodationList } from "../../redux/reduxAccommodation";
import { getAttractionList } from "../../redux/reduxAttraction";

const CreateSupportTicketScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [supportTicket, setSupportTicket] = useState('');
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        ticket_type: '',
        description: '',
        ticket_category: '',
        attraction_id: null,
        accommodation_id: null,
        restaurant_id: null,
        telecom_id: null,
        deal_id: null,
        tour_id: null,
        booking_id: null
    });
    const [attractionsList, setAttractionsList] = useState([]);
    const [accommodationsList, setAccommodationsList] = useState([]);
    const [restaurantsList, setRestaurantsList] = useState([]);
    const [telecomsList, setTelecomsList] = useState([]);
    const [dealsList, setDealsList] = useState([]);
    const [bookingsList, setBookingsList] = useState([]);

    const route = useRoute();

    async function fetchUser() {
        const userData = await getUser();
        setUser(userData);

        const userType = await getUserType();
    }

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (values.ticket_type === 'VENDOR' && values.ticket_category === 'ATTRACTION') {
            fetchAttractions();
        } else if (values.ticket_type === 'VENDOR' && values.ticket_category === 'ACCOMMODATION') {
            fetchAccommodations();
        } else if (values.ticket_type === 'VENDOR' && values.ticket_category === 'RESTAURANT') {
            fetchRestaurants();
        } else if (values.ticket_type === 'VENDOR' && values.ticket_category === 'TELECOM') {
            fetchTelecoms();
        } else if (values.ticket_type === 'VENDOR' && values.ticket_category === 'DEAL') {
            fetchDeals();
        } else if (values.ticket_category === 'BOOKING' || values.ticket_category === 'REFUND' || values.ticket_category === 'CANCELLATION') {
            fetchBookings();
        }
    }, [values.ticket_type, values.ticket_category]);

    useEffect(() => {
    }, [attractionsList, accommodationsList, restaurantsList, telecomsList, dealsList, bookingsList]);

    const fetchAttractions = async () => {
        try {
            let response = await getAttractionList();
            setAttractionsList(response.data);
        } catch (error) {
            alert('An error occur! Failed to retrieve attraction list!');
            setLoading(false);
        }
    }

    const fetchAccommodations = async () => {
        try {
            let response = await getAccommodationList();
            setAccommodationsList(response);
        } catch (error) {
            alert('An error occur! Failed to retrieve accommodation list!');
            setLoading(false);
        }
    }

    const fetchRestaurants = async () => {
        try {
            let response = await getRestaurantList();
            setRestaurantsList(response.data);
        } catch (error) {
            alert('An error occur! Failed to retrieve restaurant list!');
            setLoading(false);
        }
    }

    const fetchTelecoms = async () => {
        try {
            let response = await getPublishedTelecomList();
            setTelecomsList(response.data);
        } catch (error) {
            alert('An error occur! Failed to retrieve telecom list!');
            setLoading(false);
        }
    }

    const fetchDeals = async () => {
        try {
            let response = await getPublishedDealList();
            setDealsList(response.data);
        } catch (error) {
            alert('An error occur! Failed to retrieve deal list!');
            setLoading(false);
        }
    }

    const fetchBookings = async () => {
        try {
            let response = await getBookingHistoryList(user.user_id);
            console.log("response", response)
            setBookingsList(response);
        } catch (error) {
            alert('An error occur! Failed to retrieve booking list!');
            setLoading(false);
        }
    }

    async function onSubmit() {

        setLoading(true);

        let supportTicketObj;

        console.log("values", values)

        if (values.booking_id != null) {

            supportTicketObj = {
                description: values.description,
                ticket_category: values.ticket_category,
                ticket_type: values.ticket_type,
            }
            
            let response = await createSupportTicketForBooking(user.user_id, values.booking_id, supportTicketObj);
            if (response.status) {
                console.log("createSupportTicket response", response.status)
                Toast.show({
                    type: 'success',
                    text1: 'Support ticket created!'
                })

                setLoading(false);

                navigation.reset({
                    index: 2,
                    routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'SupportTicketScreen' }],
                });

            } else {
                console.log('error')
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
                setLoading(false);
            }

        } else {

            if (values.ticket_type == "ADMIN") {

                supportTicketObj = {
                    description: values.description,
                    ticket_category: values.ticket_category,
                }

                console.log("user.user_id", user.user_id)

                let response = await createSupportTicketToAdmin(user.user_id, supportTicketObj);
                if (response.status) {
                    console.log("createSupportTicket response", response.status)
                    Toast.show({
                        type: 'success',
                        text1: 'Support ticket created!'
                    })

                    setLoading(false);

                    navigation.reset({
                        index: 2,
                        routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'SupportTicketScreen' }],
                    });

                } else {
                    console.log('error')
                    Toast.show({
                        type: 'error',
                        text1: response.data.errorMessage
                    })
                    setLoading(false);
                }

            } else if (values.ticket_type == "VENDOR") { 

                let activityId = 0;

                if (values.ticket_category == "ATTRACTION") {

                    supportTicketObj = {
                        description: values.description,
                        ticket_category: values.ticket_category,
                        ticket_type: values.ticket_type,
                    }

                    activityId = values.attraction_id;

                } else if (values.ticket_category == "ACCOMMODATION") {

                    supportTicketObj = {
                        description: values.description,
                        ticket_category: values.ticket_category,
                        ticket_type: values.ticket_type,
                    }

                    console.log("supportTicketObj", supportTicketObj)

                    activityId = values.accommodation_id;

                } else if (values.ticket_category == "TELECOM") {

                    supportTicketObj = {
                        description: values.description,
                        ticket_category: values.ticket_category,
                        ticket_type: values.ticket_type,
                    }

                    activityId = values.telecom_id;

                } else if (values.ticket_category == "RESTAURANT") {

                    supportTicketObj = {
                        description: values.description,
                        ticket_category: values.ticket_category,
                        ticket_type: values.ticket_type,
                    }

                    activityId = values.restaurant_id;

                } else if (values.ticket_category == "DEAL") {

                    supportTicketObj = {
                        description: values.description,
                        ticket_category: values.ticket_category,
                        ticket_type: values.ticket_type,
                    }

                    activityId = values.deal_id;

                } // and tour if adding

                console.log("user.user_id", user.user_id)
                console.log("activityId", activityId)
                console.log("supportTicketObj", supportTicketObj)

                let response = await createSupportTicketToVendor(user.user_id, activityId, supportTicketObj);
                if (response.status) {
                    console.log("createSupportTicket response", response.status)
                    Toast.show({
                        type: 'success',
                        text1: 'Support ticket created!'
                    })

                    setLoading(false);

                    navigation.reset({
                        index: 2,
                        routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'SupportTicketScreen' }],

                    });

                } else {
                    console.log('error')
                    Toast.show({
                        type: 'error',
                        text1: response.data.errorMessage
                    })
                    setLoading(false);
                }
            }
        }
    }

    function getReferenceNumber(booking) {
        let date = new Date(booking.start_datetime);
        let day = date.getDate();
        let month = date.getMonth();
        let year = date.getFullYear();
        let temp = '' + booking.booking_id + day + month + year;
        return temp;
    }

    return (
        <Background style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.header}>
                Create Support Ticket
            </Text>

            <ScrollView automaticallyAdjustKeyboardInsets={true}>
                <View style={{ alignItems: 'center', minHeight: '100%' }}>
                    <RNPickerSelect
                        placeholder={{
                            label: 'Send to...',
                            value: null,
                        }}
                        onValueChange={(value) => setValues({ ...values, ticket_type: value })}
                        items={[
                            { label: 'Admin', value: 'ADMIN' },
                            { label: 'Vendor', value: 'VENDOR' },
                        ]}
                        value={values.ticket_type}
                        style={pickerSelectStyles}
                    />
                    <RNPickerSelect
                        placeholder={{
                            label: 'Select Category...',
                            value: null,
                        }}
                        onValueChange={(value) => setValues({ ...values, ticket_category: value })}
                        items={[
                            { label: 'General Enquiry', value: 'GENERAL_ENQUIRY' },
                            { label: 'Booking - General', value: 'BOOKING' },
                            { label: 'Booking - Refund', value: 'REFUND' },
                            { label: 'Booking - Cancellation', value: 'CANCELLATION' },
                            { label: 'Attraction', value: 'ATTRACTION' },
                            { label: 'Accommodation', value: 'ACCOMMODATION' },
                            { label: 'Restaurant', value: 'RESTAURANT' },
                            { label: 'Telecom', value: 'TELECOM' },
                            { label: 'Deal', value: 'DEAL' },
                            { label: 'Tour', value: 'TOUR' },
                        ]}
                        value={values.ticket_category}
                        style={pickerSelectStyles}
                    />
                    {(values.ticket_category === 'BOOKING' || values.ticket_category === 'REFUND' || values.ticket_category === 'CANCELLATION') && (
                        <RNPickerSelect
                            placeholder={{
                                label: 'Choose Booking...',
                                value: null,
                            }}
                            onValueChange={(value) => setValues({ ...values, booking_id: value })}
                            items={bookingsList.map(booking => ({ label: `#${getReferenceNumber(booking)} (${booking.activity_name})`, value: booking.booking_id }))}
                            value={values.booking_id}
                            style={pickerSelectStyles}
                        />
                    )}
                    {values.ticket_type === 'VENDOR' && values.ticket_category === 'ATTRACTION' && (
                        <RNPickerSelect
                            placeholder={{
                                label: 'Choose Attraction...',
                                value: null,
                            }}
                            onValueChange={(value) => setValues({ ...values, attraction_id: value })}
                            items={attractionsList.map(attraction => ({ label: attraction.name, value: attraction.attraction_id }))}
                            value={values.attraction_id}
                            style={pickerSelectStyles}
                        />
                    )}
                    {(values.ticket_type === 'VENDOR') && values.ticket_category === 'ACCOMMODATION' && (
                        <RNPickerSelect
                            placeholder={{
                                label: 'Choose Accommodation...',
                                value: null,
                            }}
                            onValueChange={(value) => setValues({ ...values, accommodation_id: value })}
                            items={accommodationsList.map(accommodation => ({ label: accommodation.name, value: accommodation.accommodation_id }))}
                            value={values.accommodation_id}
                            style={pickerSelectStyles}
                        />
                    )}
                    {values.ticket_type === 'VENDOR' && values.ticket_category === 'RESTAURANT' && (
                        <RNPickerSelect
                            placeholder={{
                                label: 'Choose Restaurant...',
                                value: null,
                            }}
                            onValueChange={(value) => setValues({ ...values, restaurant_id: value })}
                            items={restaurantsList.map(restaurant => ({ label: restaurant.name, value: restaurant.restaurant_id }))}
                            value={values.restaurant_id}
                            style={pickerSelectStyles}
                        />
                    )}
                    {values.ticket_type === 'VENDOR' && values.ticket_category === 'TELECOM' && (
                        <RNPickerSelect
                            placeholder={{
                                label: 'Choose Telecom...',
                                value: null,
                            }}
                            onValueChange={(value) => setValues({ ...values, telecom_id: value })}
                            items={telecomsList.map(telecom => ({ label: telecom.name, value: telecom.telecom_id }))}
                            value={values.telecom_id}
                            style={pickerSelectStyles}
                        />
                    )}
                    {values.ticket_type === 'VENDOR' && values.ticket_category === 'DEAL' && (
                        <RNPickerSelect
                            placeholder={{
                                label: 'Choose Deal...',
                                value: null,
                            }}
                            onValueChange={(value) => setValues({ ...values, deal_id: value })}
                            items={dealsList.map(deal => ({ label: deal.name, value: deal.deal_id }))}
                            value={values.deal_id}
                            style={pickerSelectStyles}
                        />
                    )}

                    <TextInput
                        style={styles.description}
                        label="Write your message here"
                        multiline={true}
                        value={values.description}
                        onChangeText={(value) => setValues({ ...values, description: value })}
                        errorText={values.description ? InputValidator.text(values.description) : ''}
                    />
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Button
                            mode="contained"
                            text={"Submit"}
                            onPress={onSubmit}
                        />
                    </View>
                </View>
            </ScrollView>
        </Background>
    )
}

const styles = StyleSheet.create({
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
    boldText: {
        fontWeight: 'bold',
    },
    header: {
        fontSize: 21,
        color: theme.colors.primary,
        fontWeight: 'bold',
        paddingVertical: 12,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10
    },
    description: {
        width: 320,
        height: 200,
        marginTop: -15,
        textAlignVertical: 'top'
    }
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30,
        marginBottom: 15,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
    },
});

export default CreateSupportTicketScreen
