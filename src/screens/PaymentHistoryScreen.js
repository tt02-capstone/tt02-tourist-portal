import React, { useState, useEffect } from 'react'
import Background from '../components/CardBackground'
import Button from '../components/Button'
import { View, ScrollView, StyleSheet, } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getPaymentHistoryList } from '../redux/reduxBooking';
import { getUser, getUserType } from '../helpers/LocalStorage';
import { useFocusEffect } from '@react-navigation/native';

const PaymentHistoryScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

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
                setData(listOfPayments.sort((a, b) => b.payment_id - a.payment_id));
                setLoading(false);
            } catch (error) {
                alert('An error occur! Failed to retrieve payment list!');
                setLoading(false);
            }
        }
        onLoad();
    }, []);

    const getColorForStatus = (label) => {
        const labelColorMap = {
            'true': 'lightgreen',
            'false': 'lightpink'
        };

        return labelColorMap[label] || 'gray';
    };

    const getPaidStatus = (status) => {
        if (status) {
            return 'Paid';
        } else {
            return 'Unpaid';
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
                            <Card>
                                <Card.Title style={styles.header}>
                                    Payment ID: {item.payment_id}
                                </Card.Title>
                                <Text style={styles.description}>
                                    Payment Amount: S${item.payment_amount} {'\n'} {'\n'}
                                    Booking ID: {item.booking.booking_id}
                                </Text>
                                <View style={{ display: 'inline-block' }}>
                                    <Text style={[styles.tag, { backgroundColor: getColorForStatus(item.is_paid) }]}>{getPaidStatus(item.is_paid)}</Text>
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
        width: 60,
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