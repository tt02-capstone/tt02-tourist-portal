import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, CheckBox } from '@rneui/themed';
import { getSupportTicket } from '../../redux/supportRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'

const SupportTicketDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [supportTicket, setSupportTicket] = useState('');
    const [loading, setLoading] = useState(false);

    const route = useRoute();
    const { supportTicketId } = route.params;

    async function fetchUser() {
        const userData = await getUser();
        setUser(userData);

        const userType = await getUserType();
    }

    const getColorForType = (label) => {
        const labelColorMap = {
            'HISTORICAL': 'lightblue',
            'CULTURAL': 'lightgreen',
            'NATURE': 'orange',
            'ADVENTURE': 'yellow',
            'SHOPPING': 'turquoise',
            'ENTERTAINMENT': 'lightpink'
        };

        return labelColorMap[label] || 'gray';
    };

    const fetchSupportTicket = async () => {
        console.log("supportTicketId",supportTicketId);
        try {
            let response = await getSupportTicket(supportTicketId);
            console.log("response",response);
            setSupportTicket(response.data);
            setLoading(false);
            fetchUser();
        } catch (error) {
            alert('An error occur! Failed to retrieve supportTicket details!');
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSupportTicket(); // when the page load the first time
    }, []);

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

    return supportTicket ? (
        <Background>
            <ScrollView>
                <Card>
                    <Card.Title style={styles.header}>
                        {getNameForSupportTicket(supportTicket)}
                    </Card.Title>

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

                </Card>
                {/* <Card>
                    <Card.Title style={styles.header}>
                        Cancellation Policy
                    </Card.Title>
                    <Text style={[styles.description]}>Full refund if cancelled by {getCancellationDate(supportTicket.start_datetime)}.</Text>
                    {supportTicket.status != 'CANCELLED' && <Button style={{ width: '100%' }} text="Cancel SupportTicket" mode="contained" onPress={() => cancelSupportTicket(supportTicket.supportTicket_id)} />}
                </Card> */}
            </ScrollView>
        </Background>
    ) : ''
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

export default SupportTicketDetailsScreen
