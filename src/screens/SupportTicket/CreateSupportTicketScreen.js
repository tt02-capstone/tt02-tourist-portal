
import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, CheckBox } from '@rneui/themed';
import TextInput from '../../components/TextInput';
import InputValidator from '../../helpers/InputValidator';
import { createSupportTicketToAdmin, createSupportTicketToVendor, createSupportTicketForBooking } from '../../redux/supportRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'
import RNPickerSelect from 'react-native-picker-select';

const CreateSupportTicketScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [supportTicket, setSupportTicket] = useState('');
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        ticket_type: '',
        description: '',
        ticket_category: '',
    });
    const [index, setIndex] = React.useState(0);

    const route = useRoute();

    async function fetchUser() {
        const userData = await getUser();
        setUser(userData);

        const userType = await getUserType();
    }

    async function onSubmit(values) {

        let supportTicketObj;

        if (values.ticket_type == "ADMIN") {

            supportTicketObj = {
                description: values.description,
                ticket_category: values.ticket_category,
                ticket_type: values.ticket_type,
            }

            let response = await createSupportTicketToAdmin(user.user_id, supportTicketObj);
            if (response.status) {
                createSupportTicketForm.resetFields();
                setGetSupportTicketsData(true);
                setIsCreateSupportTicketModalOpen(false);
                console.log("createSupportTicket response", response.status)
                toast.success('Support ticket successfully created!', {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 1500
                });

            } else {
                console.log("Support ticket creation failed!");
                console.log(response.data);
                toast.error(response.data.errorMessage, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 1500
                });
            }

        } else { // equals to VENDOR

            let activityId = 0;

            if (values.ticket_category == "ATTRACTION") {

                supportTicketObj = {
                    description: values.description,
                    ticket_category: values.ticket_category,
                    ticket_type: values.ticket_type,
                    attraction: { attraction_id: values.attraction_id }
                }

                activityId = values.attraction_id;

            } else if (values.ticket_category == "ACCOMMODATION") {

                supportTicketObj = {
                    description: values.description,
                    ticket_category: values.ticket_category,
                    ticket_type: values.ticket_type,
                    accommodation: { accommodation_id: values.accommodation_id }
                }

                activityId = values.accommodation_id;

            } else if (values.ticket_category == "TELECOM") {

                supportTicketObj = {
                    description: values.description,
                    ticket_category: values.ticket_category,
                    ticket_type: values.ticket_type,
                    telecom: { telecom_id: values.telecom_id }
                }

                activityId = values.telecom_id;

            } else if (values.ticket_category == "RESTAURANT") {

                supportTicketObj = {
                    description: values.description,
                    ticket_category: values.ticket_category,
                    ticket_type: values.ticket_type,
                    restaurant: { restaurant_id: values.restaurant_id }
                }

                activityId = values.restaurant_id;

            } else if (values.ticket_category == "DEAL") {

                supportTicketObj = {
                    description: values.description,
                    ticket_category: values.ticket_category,
                    ticket_type: values.ticket_type,
                    deal: { deal_id: values.deal_id }
                }

                activityId = values.deal_id;

            } // and tour if adding

            let response = await createSupportTicketToVendor(user.user_id, activityId, supportTicketObj);
            if (response.status) {
                createSupportTicketForm.resetFields();
                setGetSupportTicketsData(true);
                setIsCreateSupportTicketModalOpen(false);
                console.log("createSupportTicket response", response.status)
                toast.success('Support ticket successfully created!', {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 1500
                });

            } else {
                console.log("Support ticket creation failed!");
                console.log(response.data);
                toast.error(response.data.errorMessage, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 1500
                });
            }
        }

    }

    const getNameForSupportTicket = (item) => {
        if (item.booking != null) {
            if (item.booking.attraction != null) {
                return item.booking.attraction.name;
            } else if (item.booking.room != null) {
                return item.booking.activity_name;
            } else if (item.booking.tour != null) {
                return item.booking.tour.name;
            } else if (item.booking.telecom != null) {
                return item.booking.telecom.name;
            } else {
                return item.booking.deal.name;
            }
        } else if (item.attraction != null) {
            return item.attraction.name;
        } else if (item.accommodation != null) {
            return item.activity_name;
        } else if (item.tour != null) {
            return item.tour.name;
        } else if (item.telecom != null) {
            return item.telecom.name;
        } else if (item.restaurant != null) {
            return item.restaurant.name;
        } else if (item.deal != null) {
            return item.restaurant.name;
        } else {
            return 'Enquiry to Admin';
        }
    }

    const formatType = (type) => {
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }

    const formatStatus = (is_resolved) => {
        if (is_resolved) {
            return 'Closed';
        } else {
            return 'Open';
        }
    }

    const formatCategory = (ticket_category) => {
        if (ticket_category === 'ATTRACTION') {
            return 'Attraction';
        } else if (ticket_category === 'TOUR') {
            return 'Tour';
        } else if (ticket_category === 'ACCOMMODATION') {
            return 'Accommodation';
        } else if (ticket_category === 'TELECOM') {
            return 'Telecom';
        } else if (ticket_category === 'RESTAURANT') {
            return 'Restaurant';
        } else if (ticket_category === 'DEAL') {
            return 'Deal';
        } else if (ticket_category === 'REFUND') {
            return 'Refund';
        } else if (ticket_category === 'CANCELLATION') {
            return 'Cancellation';
        } else if (ticket_category === 'GENERAL_ENQUIRY') {
            return 'General Enquiry';
        } else if (ticket_category === 'BOOKING') {
            return 'Booking';
        }

    }

    function formatLocalDateTime(localDateTimeString) {
        const dateTime = new Date(localDateTimeString);

        const day = String(dateTime.getDate()).padStart(2, '0');
        const month = String(dateTime.getMonth() + 1).padStart(2, '0');
        const year = dateTime.getFullYear();
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        const period = dateTime.getHours() < 12 ? 'AM' : 'PM';

        return `${day}/${month}/${year}, ${hours}:${minutes} ${period}`;
    }

    const FirstRoute = () => (
        <ScrollView>
            <TextInput
                label="Ticket Type"
                onChangeText={(text) => setValues({ ...values, ticket_type: text })}
                placeholder="Ticket Type"
            />
            <TextInput
                label="Description"
                onChangeText={(text) => setValues({ ...values, description: text })}
                placeholder="Description"
                multiline={true}
                numberOfLines={4}
            />
            <Button
                text="Submit"
                mode="contained"
                onPress={onSubmit}
                style={styles.button}
            />
        </ScrollView>
    );

    const SecondRoute = () => (
        <ScrollView>
            {/* Add fields for the "To Vendor" tab here */}
        </ScrollView>
    );

    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
    });


    return (
        <Background>
            test
        </Background>
    )
}

const styles = StyleSheet.create({
    header: {
        textAlign: 'center',
        fontSize: 15,
        color: '#044537'
    },
    image: {
        width: 30, height: 30, marginRight: 10,
    },
    name: {
        fontSize: 16, marginTop: 5,
    },
    description: {
        marginBottom: 10, fontSize: 13, marginTop: 10
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
    details: {
        fontSize: 12,
        marginBottom: 5
    },
    boldText: {
        fontWeight: 'bold',
    },
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
        marginBottom: 5,
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
