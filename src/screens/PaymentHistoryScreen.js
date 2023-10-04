import React, { useState, useEffect } from 'react'
import Background from '../components/CardBackground'
import Button from '../components/Button'
import { View, ScrollView, StyleSheet, } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getPaymentHistoryList } from '../redux/reduxBooking';
import { getUser, getUserType } from '../helpers/LocalStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from "@react-navigation/native";

const PaymentHistoryScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)

        const usertype = await getUserType()
    }

    useEffect(() => {
        async function onLoad() {
            try {
                const userData = await getUser();
                setUser(userData);
                const userId = userData.user_id;

                let listOfPayments = await getPaymentHistoryList(userId);
                console.log(listOfPayments);
                setData(listOfPayments.sort((a, b) => b.payment_id - a.payment_id));
                setLoading(false);
            } catch (error) {
                alert('An error occur! Failed to retrieve payment list!');
                setLoading(false);
            }
        }
        onLoad();

        if (isFocused) {
            onLoad();   
        }
    }, [isFocused]);

    const getColorForStatus = (bookingStatus) => {
        const labelColorMap = {
            'UPCOMING': 'lightgreen',
            'ONGOING': 'lightgreen',
            'COMPLETED': 'lightgreen',
            'CANCELLED': 'lightpink'
        };
        console.log(bookingStatus);
        return labelColorMap[bookingStatus] || 'gray';
    };

    const getPaidStatus = (status, startDate, lastUpdatedDate, bookingStatus) => {
        let formattedStartDate = new Date(startDate);
        let formattedUpdatedDate = new Date(lastUpdatedDate);
        let timeDifference = formattedStartDate - formattedUpdatedDate;
        let daysDifference = timeDifference / (24 * 60 * 60 * 1000);

        if (bookingStatus != 'CANCELLED') {
            return 'Paid';
        } else if (bookingStatus == 'CANCELLED' && daysDifference >= 3) {
            return 'Refunded';
        } else {
            return 'Not Eligible for Refund';
        }
    }

    const viewBooking = (booking_id) => {
        navigation.navigate('BookingDetailsScreen', { bookingId: booking_id });
    }

    return data.length !== 0 ? (
        <Background>
            <ScrollView>
                <View style={styles.container}>
                    {
                        data.map((item, index) => (
                            <Card key={index}>
                                <Card.Title style={styles.header}>
                                    {item.booking.activity_name}
                                </Card.Title>
                                <Text style={styles.description}>
                                    Payment Amount: S${item.payment_amount}
                                </Text>
                                <View style={{ display: 'inline-block' }}>
                                    <Text style={[styles.tag, { backgroundColor: getColorForStatus(item.booking.status) }]}>{
                                        getPaidStatus(item.is_paid, item.booking.start_datetime, item.booking.last_update, item.booking.status)}</Text>
                                </View>
                                <Button style={styles.button} text="View Booking" mode="contained" onPress={() => viewBooking(item.booking.booking_id)} />
                            </Card>
                        ))
                    }
                </View>
            </ScrollView>
        </Background>
    ) : (
        <Background>
            <ScrollView>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyMessage}>No payments made</Text>
                </View>
            </ScrollView>
        </Background>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fonts: {
        marginBottom: 8,
    },
    user: {
        flexDirection: 'row', marginBottom: 6,
    },
    image: {
        width: 30, height: 30, marginRight: 10,
    },
    name: {
        fontSize: 16, marginTop: 5,
    },
    description: {
        marginBottom: 20, fontSize: 13, marginTop: 10
    },
    tag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 80,
        fontSize: 11,
        fontWeight: 'bold'
    },
    header: {
        color: '#044537',
        fontSize: 15
    },
    emptyContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8
    },
    emptyMessage: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'gray',
        textAlign: 'center'
    },
    button: {
        width: '100%'
    }
});

export default PaymentHistoryScreen