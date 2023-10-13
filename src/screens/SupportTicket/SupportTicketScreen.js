import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getAllSupportTicketsByUser, createSupportTicketToAdmin, createSupportTicketToVendor, createSupportTicketForBooking } from '../../redux/supportRedux';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from "@react-navigation/native";
import RNPickerSelect from 'react-native-picker-select';
import CreateSupportTicketScreen from './CreateSupportTicketScreen';

const SupportTicketScreen = ({ navigation }) => {

    const [user, setUser] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();
    const [fullSupportTicketList, setFullSupportTicketList] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [supportTicketTypeFilter, setSupportTicketTypeFilter] = useState(null);
    const [supportTicketStatusFilter, setSupportTicketStatusFilter] = useState(null);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    useEffect(() => {
        async function onLoad() {
            try {
                console.log("trying to load")
                const userData = await getUser();
                setUser(userData);
                const userId = userData.user_id;

                console.log("before retrieving support tickets")
                let response = await getAllSupportTicketsByUser(userId);
                console.log("response.data", response.data)
                setData(response.data);
                setFullSupportTicketList(response.data);
                console.log("fullSupportTicketList", fullSupportTicketList);
                setLoading(false);
            } catch (error) {
                alert('An error occurred! Failed to retrieve supportTicket list!');
                setLoading(false); 
            }
        }
        onLoad();

    }, []);

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
            case 'supportTicketType':
                setSupportTicketTypeFilter(filterValue);
                break;
            case 'supportTicketStatus':
                setSupportTicketStatusFilter(filterValue);
                break;
            default:
                break;
        }
    };

    const clearFilters = () => {
        setSelectedFilters([]);
        setSupportTicketTypeFilter(null);
        setSupportTicketStatusFilter(null);
        setTimeout(() => {
            setData(fullSupportTicketList);
        }, 10);
    };

    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const applyFilters = () => {
        let filteredList = fullSupportTicketList;

        for (const filter of selectedFilters) {
            switch (filter.type) {
                case 'supportTicketType':
                    filteredList = filteredList.filter(item => item.ticket_category === filter.value);
                    break;
                case 'supportTicketStatus':
                    filteredList = filteredList.filter(item => item.is_resolved === filter.value);
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
            'Closed': 'lightgreen',
            'Open': 'lightpink',
        };

        return labelColorMap[label] || 'gray';
    };

    const getNameForSupportTicket = (item) => {
        if (item.booking != null) {
            console.log("item.booking", item.booking)
            if (item.booking.attraction != null) {
                return 'Enquiry to ' + item.booking.attraction.name;
            } else if (item.booking.room != null) {
                return 'Enquiry to ' + item.booking.activity_name;
            } else if (item.booking.tour != null) {
                return 'Enquiry to ' + item.booking.tour.name;
            } else if (item.booking.telecom != null) {
                return 'Enquiry to ' + item.booking.telecom.name;
            } else if (item.booking.deal != null) {
                return 'Enquiry to ' + item.booking.deal.name;
            } else {
                return 'Booking not linked';
            }
        } else if (item.attraction != null) {
            return 'Enquiry to ' + item.attraction.name;
        } else if (item.accommodation != null) {
            return 'Enquiry to ' + item.accommodation.name;
        } else if (item.tour != null) {
            return 'Enquiry to ' + item.tour.name;
        } else if (item.telecom != null) {
            return 'Enquiry to ' + item.telecom.name;
        } else if (item.restaurant != null) {
            return 'Enquiry to ' + item.restaurant.name;
        } else if (item.deal != null) {
            return 'Enquiry to ' + item.restaurant.name;
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

    const viewSupportTicket = (support_ticket_id) => {
        console.log("support_ticket_id", support_ticket_id);
        navigation.navigate('SupportTicketDetailsScreen', { supportTicketId: support_ticket_id });
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

                    <Button text="Create Ticket" style={styles.button} onPress={() => navigation.navigate('CreateSupportTicketScreen')} />

                    {data.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => viewSupportTicket(item.support_ticket_id)}>
                            <Card>
                                <Card.Title style={styles.header}>
                                    {getNameForSupportTicket(item)}
                                </Card.Title>

                                <Text style={styles.description}>{item.description}</Text>
                                <Text style={styles.details}>
                                    <Text style={styles.boldText}>Category:</Text> {formatCategory(item.ticket_category)}
                                </Text>
                                <Text style={styles.details}>
                                    <Text style={styles.boldText}>Status:</Text> {formatStatus(item.is_resolved)}
                                </Text>
                                <Text style={styles.details}>
                                    <Text style={styles.boldText}>Created:</Text> {formatLocalDateTime(item.created_time)}
                                </Text>
                                <Text style={styles.details}>
                                    <Text style={styles.boldText}>Updated:</Text> {formatLocalDateTime(item.updated_time)}
                                </Text>

                                <Button style={styles.cardButton} text="View Details" mode="contained" onPress={() => viewSupportTicket(item.support_ticket_id)} />
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
                                                handleFilterSelect('supportTicketType', value)
                                            }
                                            items={[
                                                { label: 'Attraction', value: 'ATTRACTION' },
                                                { label: 'Tour', value: 'TOUR' },
                                                { label: 'Accommodation', value: 'ACCOMMODATION' },
                                                { label: 'Telecom', value: 'TELECOM' },
                                                { label: 'Deal', value: 'DEAL' },
                                                { label: 'Restaurant', value: 'RESTAURANT' },
                                                { label: 'Refund', value: 'REFUND' },
                                                { label: 'Cancellation', value: 'CANCELLATION' },
                                                { label: 'General Enquiry', value: 'GENERAL_ENQUIRY' },
                                                { label: 'General Booking', value: 'BOOKING' },
                                            ]}
                                            value={supportTicketTypeFilter}
                                            style={pickerSelectStyles}
                                        />
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Select Status...',
                                                value: null,
                                            }}
                                            onValueChange={(value) => handleFilterSelect('supportTicketStatus', value)}
                                            items={[
                                                { label: 'Open', value: false },
                                                { label: 'Closed', value: true },
                                            ]}
                                            value={supportTicketStatusFilter}
                                            style={pickerSelectStyles}
                                        />
                                    </View>

                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity onPress={applyFilters} style={[styles.filterButton, { marginRight: 5 }]}>
                                            <Text style={styles.filterText}>Apply</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={toggleFilterModal} style={styles.filterButton}>
                                            <Text style={styles.filterText}>Close</Text>
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

                    <Text style={styles.emptyMessage}>No support tickets made</Text>
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
    cardButton: {
        width: '100%',
    },
    button: {
        width: '50%',
        marginLeft: '25%',
        marginRight: '25%',
    },
    details: {
        fontSize: 12,
        marginBottom: 5
    },
    boldText: {
        fontWeight: 'bold',
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

export default SupportTicketScreen
