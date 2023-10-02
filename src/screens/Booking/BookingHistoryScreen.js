import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getBookingHistoryList } from '../../redux/reduxBooking';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from "@react-navigation/native";
import RNPickerSelect from 'react-native-picker-select';

const BookingHistoryScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();
    const [fullBookingList, setFullBookingList] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [bookingTypeFilter, setBookingTypeFilter] = useState(null);
    const [bookingStatusFilter, setBookingStatusFilter] = useState(null);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    useEffect(() => {
        async function onLoad() {
            try {
                const userData = await getUser();
                setUser(userData);
                const userId = userData.user_id;

                let listOfBookings = await getBookingHistoryList(userId);
                setData(listOfBookings.sort((a, b) => b.booking_id - a.booking_id));
                setFullBookingList(listOfBookings);
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

    // Function to handle filter selection
    const handleFilterSelect = (filterType, filterValue) => {
        const newSelectedFilters = [...selectedFilters];
        const filterIndex = newSelectedFilters.findIndex(filter => filter.type === filterType);

        if (filterIndex !== -1) {
            // If the filter type already exists, update the value
            newSelectedFilters[filterIndex].value = filterValue;
        } else {
            // If the filter type does not exist, add a new filter
            newSelectedFilters.push({ type: filterType, value: filterValue });
        }

        setSelectedFilters(newSelectedFilters);

        // Update individual filter states
        switch (filterType) {
            case 'bookingType':
                setBookingTypeFilter(filterValue);
                break;
            case 'bookingStatus':
                setBookingStatusFilter(filterValue);
                break;
            default:
                break;
        }
    };

    const clearFilters = () => {
        setSelectedFilters([]);
        setBookingTypeFilter(null);
        setBookingStatusFilter(null);
        setTimeout(() => {
            setData(fullBookingList);
        }, 10);
    };

    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const applyFilters = () => {
        let filteredList = fullBookingList;

        for (const filter of selectedFilters) {
            switch (filter.type) {
                case 'bookingType':
                    filteredList = filteredList.filter(item => item.type === filter.value);
                    break;
                case 'bookingStatus':
                    filteredList = filteredList.filter(item => item.status === filter.value);
                    break;
                default:
                    break;
            }
        }

        setData(filteredList);
        toggleFilterModal();
    };


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
            return item.activity_name;
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

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={toggleFilterModal} style={styles.filterButton}>
                            <Text style={styles.filterText}>Filter</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={clearFilters} style={styles.filterButton}>
                            <Text style={styles.filterText}>Clear Filters</Text>
                        </TouchableOpacity>
                    </View>


                    {data.map((item, index) => (
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
                                            uri: getImage(item)
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

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isFilterModalVisible}
                        onRequestClose={toggleFilterModal}
                    >
                        <View style={styles.modalBackground}>
                            <View style={styles.modalContainer}>
                                <ScrollView>
                                    <View style={styles.filterBox}>
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Select Type...',
                                                value: null,
                                            }}
                                            onValueChange={(value) =>
                                                handleFilterSelect('bookingType', value)
                                            }
                                            items={[
                                                { label: 'Attraction', value: 'ATTRACTION' },
                                                { label: 'Tour', value: 'TOUR' },
                                                { label: 'Accommodation', value: 'ACCOMMODATION' },
                                                { label: 'Telecom', value: 'TELECOM' },
                                            ]}
                                            value={bookingTypeFilter}
                                            style={pickerSelectStyles}
                                        />
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Select Status...',
                                                value: null,
                                            }}
                                            onValueChange={(value) => handleFilterSelect('bookingStatus', value)}
                                            items={[
                                                { label: 'Upcoming', value: 'UPCOMING' },
                                                { label: 'Ongoing', value: 'ONGOING' },
                                                { label: 'Completed', value: 'COMPLETED' },
                                                { label: 'Cancelled', value: 'CANCELLED' },
                                            ]}
                                            value={bookingStatusFilter}
                                            style={pickerSelectStyles}
                                        />
                                    </View>

                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity onPress={applyFilters} style={styles.filterButton}>
                                            <Text style={styles.filterText}>Apply</Text>
                                        </TouchableOpacity>
                                    </View>


                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                </View>
            </ScrollView>
        </Background>
    ) : (
        <Background>
            <ScrollView>
                <View style={styles.emptyContainer}>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={toggleFilterModal} style={styles.filterButton}>
                            <Text style={styles.filterText}>Filter</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={clearFilters} style={styles.filterButton}>
                            <Text style={styles.filterText}>Clear Filters</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.emptyMessage}>No bookings made</Text>
                </View>
            </ScrollView>
        </Background>
    )
}

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
    },
    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 16,
    },
    filterBox: {
        flex: 1,
        margin: 8,
    },
    filterButton: {
        backgroundColor: '#eb8810',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        marginLeft: 10,
        alignItems: 'center',
        alignSelf: 'center',
        width: '30%',
    },
    filterText: {
        color: 'white',
        fontWeight: 'bold',
    },
    card: {
        marginBottom: 16,
    },
    cardImage: {
        padding: 0,
    },
    cardTitle: {
        fontSize: 16,
        marginBottom: 10,
    },
    cardDescription: {
        fontSize: 13,
        marginBottom: 10,
    },
    tagContainer: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContainer: {
        backgroundColor: 'white',
        width: '80%',
        borderRadius: 10,
        padding: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        width: '100%',
    },
});

export default BookingHistoryScreen