import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, CheckBox } from '@rneui/themed';
import { getBookingByBookingId, cancelBookingByBookingId, getTourImage } from '../../redux/reduxBooking';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'

const BookingDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [booking, setBooking] = useState('');
    const [loading, setLoading] = useState(false);
    const [tourImage, setTourImage] = useState('');

    const route = useRoute();
    const { bookingId } = route.params;

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)

        const usertype = await getUserType()
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

    const fetchBooking = async () => {
        try {
            let booking = await getBookingByBookingId(bookingId);
            setBooking(booking);

            if (booking.tour) {
                try {
                    let tourImg = await getTourImage(booking.tour.tour_id);
                    setTourImage(tourImg.info);
                } catch(error) {
                    setTourImage('https://tt02.s3.ap-southeast-1.amazonaws.com/static/mobile/tour2.png');
                }                
            }

            setLoading(false);
            fetchUser();
        } catch (error) {
            alert('An error occur! Failed to retrieve booking details!');
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBooking(); // when the page load the first time
    }, []);

    const getNameForBooking = (item) => {
        console.log("item", item);
        if (item.attraction != null) {
            return item.attraction.name;
        } else if (item.room != null) {
            return item.activity_name;
        } else if (item.tour != null) {
            return item.booking_item_list[0].activity_selection;
        } else if (item.telecom != null) {
            return item.telecom.name;
        } else {
            return item.deal.name;
        }
    }

    const getImage = (item) => {
        if (item.attraction != null) {
            return item.attraction.attraction_image_list[0];
        } else if (item.room != null) {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/accoms.jpg';
        } else if (item.tour != null) {
            return tourImage;
        } else if (item.telecom.name != null) {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/telecom.png';
        } else {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/discount.png';
        }
    }

    const formatType = (type) => {
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }

    const formatDate = (date) => {
        let inputDate = new Date(date);
        let day = inputDate.getDate().toString().padStart(2, '0');
        let month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
        let year = inputDate.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);

        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        };

        const formattedDateTime = date.toLocaleString('en-US', options);

        return formattedDateTime;
    }

    const getCancellationDate = (date) => {
        let inputDate = new Date(date);
        inputDate.setDate(inputDate.getDate() - 3);
        let day = inputDate.getDate().toString().padStart(2, '0');
        let month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
        let year = inputDate.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const getColorForStatus = (label) => {
        const labelColorMap = {
            'UPCOMING': 'lightgreen',
            'ONGOING': 'lightgreen',
            'COMPLETED': 'lightblue',
            'CANCELLED': 'lightpink'
        };

        return labelColorMap[label] || 'gray';
    };

    async function cancelBooking(bookingId) {
        let response = await cancelBookingByBookingId(bookingId);
        if (!response.status) {
            Toast.show({
                type: 'success',
                text1: 'Booking has been cancelled!'
            });
            const timer = setTimeout(() => {
                fetchBooking();
            }, 1000);
        } else {
            Toast.show({
                type: 'error',
                text1: response.info
            })
        }
    }

    return booking ? (
        <Background>
            <ScrollView>
                <Card>
                    <Card.Title style={styles.header}>
                        {getNameForBooking(booking)}
                    </Card.Title>
                    <Card.Image
                        style={{ padding: 0 }}
                        source={{
                            uri: getImage(booking)
                        }}
                    />
                    <Text style={styles.description}>Total Paid: S${booking.payment.payment_amount.toFixed(2)}</Text>
                    <Text style={styles.description}>Type: {formatType(booking.type)}</Text>
                    {!booking.tour && <Text style={styles.description}>Start Date: {formatDate(booking.start_datetime)}</Text>}
                    {booking.tour && <Text style={styles.description}>Start Date: {formatDateTime(booking.start_datetime)}</Text>}
                    {!booking.tour && <Text style={styles.description}>End Date: {formatDate(booking.end_datetime)}</Text>}
                    {booking.tour && <Text style={styles.description}>End Date: {formatDateTime(booking.end_datetime)}</Text>}
                    <View style={{ display: 'inline-block' }}>
                        <Text style={[styles.tag, { backgroundColor: getColorForStatus(booking.status) }]}>{booking.status}</Text>
                    </View>
                </Card>
                <Card>
                    <Card.Title style={styles.header}>
                        Cancellation Policy
                    </Card.Title>
                    <Text style={[styles.description]}>Full refund if cancelled by {getCancellationDate(booking.start_datetime)}.</Text>
                    {booking.status != 'CANCELLED' && <Button style={{ width: '100%' }} text="Cancel Booking" mode="contained" onPress={() => cancelBooking(booking.booking_id)} />}
                </Card>
                {booking.status != 'CANCELLED' && booking.qr_code_list.length > 1 && <Card>
                    <Card.Title style={styles.header}>
                        Ticket Vouchers
                    </Card.Title>
                    <ScrollView horizontal>
                        <View style={{ flexDirection: 'row', height: 350 }}>
                            {
                                booking.qr_code_list.map((item, index) => (
                                    <View key={index} style={styles.rCard}>
                                        <Card style={styles.reccom}>
                                            <Card.Title style={styles.header}>
                                                Voucher Code: {booking.qr_code_list[index].voucher_code}
                                            </Card.Title>
                                            <Card.Image
                                                style={{ padding: 0, width: 200, height: 200 }}
                                                source={{
                                                    uri: booking.qr_code_list[index].qr_code_link
                                                }}
                                            />
                                        </Card>

                                        <Text style={{ marginBottom: 15 }}></Text>
                                    </View>
                                ))
                            }
                        </View>
                    </ScrollView>
                </Card>}
                {booking.status != 'CANCELLED' && booking.qr_code_list.length == 1 && <Card>
                    <Card.Title style={styles.header}>
                        Ticket Voucher
                    </Card.Title>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        {
                            booking.qr_code_list.map((item, index) => (
                                <View key={index} style={styles.rCard}>
                                    <Card style={styles.reccom}>
                                        <Card.Title style={styles.header}>
                                            Voucher Code: {booking.qr_code_list[index].voucher_code}
                                        </Card.Title>
                                        <Card.Image
                                            style={{ padding: 0, width: 200, height: 200 }}
                                            source={{
                                                uri: booking.qr_code_list[index].qr_code_link
                                            }}
                                        />
                                    </Card>
                                    <Text style={{ marginBottom: 15 }}></Text>
                                </View>
                            ))
                        }
                    </View>
                </Card>}
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
});

export default BookingDetailsScreen