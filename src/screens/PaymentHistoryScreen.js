import React, { useState } from 'react'
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

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    // To update when nav bar is up
                    let listOfPayments = await getPaymentHistoryList(1);
                    // let listOfPayments = await getPaymentHistoryList(user.user_id);
                    setData(listOfPayments.sort((a, b) => b.payment_id - a.payment_id));
                    console.log(listOfPayments);
                    setLoading(false);
                } catch (error) {
                    alert('An error occur! Failed to retrieve payment list!');
                    setLoading(false);
                }
            };
            fetchUser();
            fetchData();
        }, [])
    );

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

    return (
        <Background>
            <ScrollView>
                <View style={styles.container}>
                    {
                        data.map((item, index) => (
                            <Card>
                                <Card.Title style={styles.header}>
                                    Payment ID: {item.payment_id}
                                    <View style={{ display: 'inline-block', marginLeft: 20 }}>
                                        <Text style={[styles.tag, { backgroundColor: getColorForStatus(item.is_paid) }]}>{getPaidStatus(item.is_paid)}</Text>
                                    </View>
                                </Card.Title>
                                <Text style={styles.description}>
                                    Payment Amount: S${item.payment_amount}<br /><br />
                                    Booking ID: {item.booking.booking_id}
                                </Text>
                                <Button text="View Booking" mode="contained" onPress={() => viewBooking(item.booking.booking_id)} />
                            </Card>
                        ))
                    }
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
        width: 110,
        fontSize: 11,
        fontWeight: 'bold'
    },
    header: {
        color: '#044537',
        fontSize: 15
    }
});

export default PaymentHistoryScreen