import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import { getUser, getUserType } from '../../helpers/LocalStorage';
import {View, ScrollView, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import { Text, Card, CheckBox } from '@rneui/themed';
import {
    getBookingByBookingId,
    cancelBookingByBookingId,
    getTourImage,
    updateBookingItemStatus
} from '../../redux/reduxBooking';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'
import { getItemVendor } from '../../redux/itemRedux';

const BookingDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [booking, setBooking] = useState('');
    const [loading, setLoading] = useState(false);
    const [tourImage, setTourImage] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [isCollected, setIsCollected] = useState(false);
    const [deliveryLocation, setDeliveryLocation] = useState('');

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
            console.log(booking.status);
            setBooking(booking);

            if (booking.tour) {
                try {
                    let tourImg = await getTourImage(booking.tour.tour_id);
                    setTourImage(tourImg.info);
                } catch(error) {
                    setTourImage('https://tt02.s3.ap-southeast-1.amazonaws.com/static/mobile/tour2.png');
                }                
            }

            if (booking.item) {
                setIsCollected(booking.item.isCollected)
                if (booking.status == "PENDING_VENDOR_PICKUP" || booking.status == "PREPARE_FOR_PICKUP" || booking.status == "READY_FOR_PICKUP" || booking.status == "PICKED_UP") {
                    let response = await getItemVendor(booking.item.item_id);
                    if (response.status) {
                        let data = response.data;
                        setPickupLocation(data.business_address)
                    } else {
                        console.log("Can't get vendor location for items")
                    }
                }

                if (booking.status == "PENDING_VENDOR_DELIVERY" || booking.status == "PREPARE_FOR_SHIPMENT" || booking.status == "SHIPPED_OUT" || booking.status == "DELIVERED") {
                    const booking_item = booking.booking_item_list[0];
                    const as = booking_item.activity_selection;
                    const parts = as.split('_');
                    setDeliveryLocation(parts[1]);
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
        if (item.attraction != null) {
            return item.attraction.name;
        } else if (item.room != null) {
            return item.activity_name;
        } else if (item.tour != null) {
            return item.booking_item_list[0].activity_selection;
        } else if (item.telecom != null) {
            return item.telecom.name;
        } else if (item.item.name != null) {
            return item.item.name;
        }  else {
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
        } else if (item.item != null) {
            return item.item.image;
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

    const getCancellationDate = (booking) => {
        let date = booking.start_datetime
        if (booking.type != "ITEM") {
            let inputDate = new Date(date);
            inputDate.setDate(inputDate.getDate() - 3);
            let day = inputDate.getDate().toString().padStart(2, '0');
            let month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
            let year = inputDate.getFullYear();
            return `${day}/${month}/${year}`;
        } else { 
            // if it is a shopping item can oni cancelled it within a day frm the date of purchase??
            let inputDate = new Date(date);
            inputDate.setDate(inputDate.getDate() + 1);
            let day = inputDate.getDate().toString().padStart(2, '0');
            let month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
            let year = inputDate.getFullYear();
            return `${day}/${month}/${year}`;
        }
    }

    const getStatusDisplayName = (currentstatus) => {
        const deliverypickup = {
            PENDING_VENDOR_DELIVERY: 'Pending Vendor Delivery',
            PREPARE_FOR_SHIPMENT: 'Prepare for Shipment',
            SHIPPED_OUT: 'Shipped Out',
            DELIVERED: 'Delivered',
            PENDING_VENDOR_PICKUP: 'Pending Vendor Pickup',
            PREPARE_FOR_PICKUP: 'Prepare for Pickup',
            READY_FOR_PICKUP: 'Ready for Pickup',
            PICKED_UP: 'Picked Up',
            CANCELLED:'Cancelled'
        }
        const displayName = deliverypickup[currentstatus] || currentstatus;

        return displayName
    };
    const getColorForStatus = (label) => {
        const labelColorMap = {
            'UPCOMING': 'green',
            'ONGOING': 'green',
            'COMPLETED': 'lightblue',
            'CANCELLED': 'red',
            'PENDING_VENDOR_DELIVERY': 'purple',
            'PENDING_VENDOR_PICKUP': 'purple',
            "PREPARE_FOR_SHIPMENT": 'orange',
            "PREPARE_FOR_PICKUP": 'orange',
            "SHIPPED_OUT": "hotpink",
            "READY_FOR_PICKUP": "hotpink",
            'DELIVERED': 'green',
            'PICKED_UP': 'green',
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

    function getReferenceNumber() {
        let date = new Date(booking.start_datetime);
        let day = date.getDate();
        let month = date.getMonth();
        let year = date.getFullYear();
        let temp = '' + booking.booking_id + day + month + year;
        return temp;
    }

    const toggleItemStatus = async () => {
        try {
            const bookingStatus = booking.status === 'SHIPPED_OUT' ? 'DELIVERED': 'PICKED_UP'

            const response = await updateBookingItemStatus(booking.booking_id, bookingStatus);
            console.log(response)
            if (response.status) {
                fetchBooking();

                Toast.show({
                    type: 'success',
                    text1: `Item marked as ${getStatusDisplayName(bookingStatus)}!`,
                });

                // Fetch updated booking details
            } else {
                Toast.show({
                    type: 'error',
                    text1: response.info,
                });
            }
        } catch (error) {
            console.error('Error marking item:', error);
        }
    };

    return booking ? (
        <Background>
            <ScrollView>
                <Card>
                    <View style={{flexDirection:'row', marginBottom: 5}}>
                        <Card.Title style={{ color:'#044537', fontSize:15, marginLeft:0}}>
                            {getNameForBooking(booking)}
                        </Card.Title>
                        <Text style={[styles.tag, {color: getColorForStatus(booking.status)}]}> [{getStatusDisplayName(booking.status)}]</Text>
                    </View>

                    <Card.Image
                        style={{ padding: 0 , width:250 , height: 250, marginLeft:40}}
                        source={{
                            uri: getImage(booking)
                        }}
                    />
                    <Text style={styles.description}>Booking Reference Number: #{getReferenceNumber()}</Text>
                    <Text style={styles.description}>Total Paid: S${booking.payment.payment_amount.toFixed(2)}</Text>
                    <Text style={styles.description}>Type: {formatType(booking.type)}</Text>
                    {!booking.tour && <Text style={styles.description}>Start Date: {formatDate(booking.start_datetime)}</Text>}
                    {booking.tour && <Text style={styles.description}>Start Date: {formatDateTime(booking.start_datetime)}</Text>}
                    {!booking.tour && <Text style={styles.description}>End Date: {formatDate(booking.end_datetime)}</Text>}
                    {booking.tour && <Text style={styles.description}>End Date: {formatDateTime(booking.end_datetime)}</Text>}

                    {pickupLocation && <Text style={styles.description}>Pick Up Location : {pickupLocation}</Text>}
                    {deliveryLocation && <Text style={styles.description}> Delivery Location : {deliveryLocation}</Text>}

                    {/* <View style={{ display: 'inline-block' }}>
                        <Text style={[styles.tag, {color: getColorForStatus(booking.status)}]}> [{getStatusDisplayName(booking.status)}]</Text>
                    </View> */}
                </Card>


                {booking.item && !isCollected && (booking.status === "SHIPPED_OUT" || booking.status ===  "READY_FOR_PICKUP") && (
                    <Card>
                        <Card.Title style={styles.header}>
                            Update Your Item Collection Status
                        </Card.Title>
                        {booking && (booking.status === 'READY_FOR_PICKUP' || booking.status === 'SHIPPED_OUT') && <Text style={{fontWeight: 'bold', color: 'red', textAlign: 'center'}}>Your item is ready for pickup!</Text>}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.description}>
                                Mark as {booking.status === "SHIPPED_OUT"? "Delivered": "Picked Up"}
                            </Text>
                            <Switch
                                value={isCollected}
                                onValueChange={() => toggleItemStatus()}
                                disabled={isCollected === true}
                            />
                        </View>
                    </Card>
                )}

                { booking.status === "UPCOMING" || booking.status === "ONGOING" || booking.status === "PENDING_VENDOR_DELIVERY" || booking.status === "PENDING_VENDOR_PICKUP" && (
                    <Card>
                        <Card.Title style={styles.header}>
                            Cancellation Policy
                        </Card.Title>
                        <Text style={[styles.description]}>Full refund if cancelled by {getCancellationDate(booking)}.</Text>
                        {booking.status != 'CANCELLED' && <Button style={{ width: '100%' }} text="Cancel Booking" mode="contained" onPress={() => cancelBooking(booking.booking_id)} />}
                    </Card>
                )}
                


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
        width: 210,
        fontSize: 12,
        marginLeft: 5,
        marginTop:2,
        fontWeight: 'bold',
        marginBottom:10
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