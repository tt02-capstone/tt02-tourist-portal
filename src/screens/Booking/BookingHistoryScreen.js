import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getBookingHistoryList } from '../../redux/reduxBooking';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from "@react-navigation/native";

const BookingHistoryScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        async function onLoad() {
            try {
                const userData = await getUser();
                setUser(userData);
                const userId = userData.user_id;

                let listOfBookings = await getBookingHistoryList(userId);
                setData(listOfBookings.sort((a, b) => b.booking_id - a.booking_id));
                setLoading(false);
            } catch (error) {
                alert('An error occur! Failed to retrieve booking list!');
                setLoading(false);
            }
        }
        onLoad();

        if (isFocused) {
            onLoad();   
        }
    }, [isFocused]);

    const getColorForStatus = (label) => {
        const labelColorMap = {
            'UPCOMING': 'lightgreen',
            'ONGOING': 'lightgreen',
            'COMPLETED': 'lightblue',
            'CANCELLED': 'lightpink'
        };

        return labelColorMap[label] || 'gray';
    };

    const getNameForBooking = (item) => {
        if (item.attraction != null) {
            return item.attraction.name;
        } else if (item.room != null) {
            return item.room.name;
        } else if (item.tour != null) {
            return item.tour.name;
        } else if (item.telecom.name != null) {
            return item.telecom.name;
        } else {
            return item.deal.name;
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

    const viewBooking = (booking_id) => {
        navigation.navigate('BookingDetailsScreen', { bookingId: booking_id });
    }

    const getImage = (item) => {
        if (item.attraction != null) {
            return item.attraction.attraction_image_list[0];
        } else if (item.room != null) {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/accoms.jpg';
        } else if (item.tour != null) {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/attractions.jpg';
        } else if (item.telecom.name != null) {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/telecom.png';
        } else {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/discount.png';
        }
    }

    return data.length !== 0 ? (
        <Background>
            <ScrollView>
                <View style={styles.container}>
                    {
                        data.map((item, index) => (
                            <TouchableOpacity key={index} onPress={() => viewBooking(item.booking_id)}>
                                <Card>
                                    <Card.Title style={styles.header}>
                                        {getNameForBooking(item)}
                                    </Card.Title>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'start',
                                        padding: 16,
                                    }}>
                                        {/* Text on the left */}
                                        <Text style={styles.description}>
                                            Booking ID: {item.booking_id} {'\n'} {'\n'}
                                            Total Paid: S${item.payment.payment_amount} {'\n'} {'\n'}
                                            Type: {formatType(item.type)} {'\n'} {'\n'}
                                            Date: {formatDate(item.start_datetime)}
                                        </Text>
                                        {/* Image on the right */}
                                        <Card.Image
                                            style={{
                                                width: 120,
                                                height: 120,
                                                marginLeft: 40,
                                            }}
                                            source={{
                                                uri: getImage(item) // KIV for image 
                                            }}
                                        />
                                    </View>
                                    <View style={{ display: 'inline-block', marginLeft: 20 }}>
                                        <Text style={[styles.tag, { backgroundColor: getColorForStatus(item.status) }]}>{item.status}</Text>
                                    </View>
                                    <Button style={styles.button} text="View Details" mode="contained" onPress={() => viewBooking(item.booking_id)} />
                                </Card>
                            </TouchableOpacity>
                        ))
                    }
                </View>
            </ScrollView>
        </Background>
    ) : (
        <Background>
            <ScrollView>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyMessage}>No bookings made</Text>
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
        width: 90,
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

export default BookingHistoryScreen