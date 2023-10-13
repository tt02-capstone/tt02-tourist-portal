import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput';
import InputValidator from '../../helpers/InputValidator';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, CheckBox } from '@rneui/themed';
import { getSupportTicket, updateSupportTicket, deleteSupportTicket, getAllRepliesBySupportTicket, createReply, updateReply, deleteReply } from '../../redux/supportRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'
import { IconButton } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';

const SupportTicketDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [supportTicket, setSupportTicket] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('view');
    const [values, setValues] = useState({
        ticket_type: '',
        description: '',
        ticket_category: '',
    });

    const route = useRoute();
    const { supportTicketId } = route.params;

    async function fetchUser() {
        const userData = await getUser();
        setUser(userData);

        const userType = await getUserType();
    }

    const fetchSupportTicket = async () => {
        console.log("supportTicketId", supportTicketId);
        try {
            let response = await getSupportTicket(supportTicketId);
            console.log("response", response);
            setSupportTicket(response.data);
            setLoading(false);
            fetchUser();

            setValues({
                ticket_type: response.data.ticket_type,
                description: response.data.description,
                ticket_category: response.data.ticket_category,
            })
        } catch (error) {
            alert('An error occur! Failed to retrieve supportTicket details!');
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSupportTicket(); // when the page load the first time
    }, []);

    const handleDeletePress = (ticketId) => {
        Alert.alert(
            "Delete Confirmation",
            "Are you sure you want to delete this ticket?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Delete Cancelled"),
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: () => handleDelete(ticketId)
                }
            ],
            { cancelable: false }
        );
    };

    async function handleDelete(supportTicketId) {
        let response = await deleteSupportTicket(supportTicketId);
        if (response.status) {
            navigation.reset({
                index: 2,
                routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'SupportTicketScreen' }],

            });
            console.log("createSupportTicket response", response.status)
            Toast.show({
                type: 'success',
                text1: 'Support ticket deleted!'
            })

        } else {
            console.log("Support ticket deletion failed!");
            console.log(response.data);
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }

    function handleEditClick() {
        setMode('edit');
    }

    function handleViewClick() {
        setMode('view');
        fetchSupportTicket();
    }

    async function handleEdit(ticketId) {

        let supportTicketObj = {
            description: values.description,
            ticket_category: values.ticket_category,
        }

        console.log("supportTicketObj", supportTicketObj);
        console.log("supportTicketId", supportTicketId);

        let response = await updateSupportTicket(supportTicketId, supportTicketObj);
        if (response.status) {
            handleViewClick();
            Toast.show({
                type: 'success',
                text1: 'Support ticket edited!'
            })

        } else {
            console.log("Support ticket edit failed!");
            console.log(response.data);
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }

    const getNameForSupportTicket = (item) => {
        if (item.booking != null) {
            if (item.booking.attraction != null) {
                return item.booking.attraction.name;
            } else if (item.booking.room != null) {
                return item.booking.accommodation.name;
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
            return item.accommodation.name;
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

    return (
        <Card>
            {mode === 'view' ? (
                <>
                    <View style={styles.headerContainer}>
                        <Card.Title style={styles.header}>
                            {getNameForSupportTicket(supportTicket)}
                        </Card.Title>
                        <IconButton
                            icon="pencil"
                            size={20}
                            style={{ alignSelf: 'flex-start' }}
                            onPress={handleEditClick}
                        />
                        <IconButton
                            icon="delete"
                            size={20}
                            style={{ alignSelf: 'flex-start' }}
                            onPress={() => handleDeletePress(supportTicketId)}
                        />
                    </View>
                    <Text style={styles.description}>{supportTicket.description}</Text>
                    <Text style={styles.details}>
                        <Text style={styles.boldText}>Category:</Text> {formatCategory(supportTicket.ticket_category)}
                    </Text>
                    <Text style={styles.details}>
                        <Text style={styles.boldText}>Status:</Text> {formatStatus(supportTicket.is_resolved)}
                    </Text>
                    <Text style={styles.details}>
                        <Text style={styles.boldText}>Created:</Text> {formatLocalDateTime(supportTicket.created_time)}
                    </Text>
                    <Text style={styles.details}>
                        <Text style={styles.boldText}>Updated:</Text> {formatLocalDateTime(supportTicket.updated_time)}
                    </Text>
                </>
            ) : (
                <>
                    <View style={{ alignItems: 'center', minHeight: '100%' }}>
                        <RNPickerSelect
                            placeholder={{
                                label: 'Select Category...',
                                value: null,
                            }}
                            onValueChange={(value) => setValues({ ...values, ticket_category: value })}
                            items={[
                                { label: 'General Enquiry', value: 'GENERAL_ENQUIRY' },
                                { label: 'General Booking', value: 'BOOKING' },
                                { label: 'Refund', value: 'REFUND' },
                                { label: 'Cancellation', value: 'CANCELLATION' },
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
                        <TextInput
                            style={styles.description}
                            label="Write your message here"
                            multiline={true}
                            value={values.description}
                            onChangeText={(description) => setValues({ ...values, description })}
                            errorText={values.description ? InputValidator.text(values.description) : ''}
                        />
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Button
                                mode="contained"
                                text={"Submit"}
                                onPress={handleEdit}
                            />
                        </View>
                    </View>
                </>
            )}
        </Card>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'relative',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    header: {
        textAlign: 'center',
        fontSize: 15,
        color: '#044537',
        marginTop: 18,
    },
    deleteIcon: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 1
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

export default SupportTicketDetailsScreen
