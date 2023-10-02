import React, { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getPublishedDealList, toggleSaveDeal } from "../../redux/dealRedux";
import { getUser, getUserType, storeUser } from "../../helpers/LocalStorage";
import { deleteSavedAttraction } from "../../redux/reduxAttraction";
import Toast from "react-native-toast-message";
import { toggleSaveTelecom } from "../../redux/telecomRedux";
import { Button } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import RNPickerSelect from 'react-native-picker-select';
import {timeZoneOffset} from "../../helpers/DateFormat";

const DealScreen = ({ navigation }) => {
    const [data, setData] = useState([]);
    const [userType, setUserType] = useState('');
    const [user, setUser] = useState('');
    const [fullDealList, setFullDealList] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [dealTypeFilter, setDealTypeFilter] = useState(null);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
        console.log(userData)
        setUserType(await getUserType());
        console.log(userType)
    }

    useEffect(() => {
        const fetchData = async () => {
            let response = await getPublishedDealList();
            if (response.status) {
                console.log("response.data", response.data)
                setFullDealList(response.data);
                setData(response.data);
                currentDate.setHours(currentDate.getHours() + timeZoneOffset)
                setCurrentDate(currentDate)
            } else {
                console.log("Deal list not fetch!");
            }
        };

        fetchData();
        fetchUser();
    }, []);

    // const viewDealDetails = (id) => {
    //     navigation.navigate('DealDetailsScreen', {id: id}); // set the attraction id here
    // }

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
            case 'dealType':
                setDealTypeFilter(filterValue);
                break;
            default:
                break;
        }
    };

    const clearFilters = () => {
        setSelectedFilters([]);
        setDealTypeFilter(null);
        setTimeout(() => {
            setData(fullDealList);
        }, 10);
    };

    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const applyFilters = () => {
        let filteredList = fullDealList;

        for (const filter of selectedFilters) {
            switch (filter.type) {
                case 'dealType':
                    filteredList = filteredList.filter(item => item.deal_type === filter.value);
                    break;
                default:
                    break;
            }
        }

        console.log(filteredList);

        setData(filteredList);
        toggleFilterModal();
    };

    function formatDealType(text) {
        if (text === 'CHINESE_NEW_YEAR') {
            return " CHINESE NEW YEAR"
        } else if (text === 'NATIONAL_DAY') {
            return "NATIONAL DAY"
        } else if (text === 'DEEPAVALLI') {
            return "DEEPAVALLI"
        } else if (text === 'NUS_WELLBEING_DAY') {
            return "NUS WELLBEING DAY"
        } else if (text === 'SINGLES_DAY') {
            return "SINGLES DAY"
        } else if (text === 'VALENTINES') {
            return "VALENTINES"
        } else if (text === 'HARI_RAYA') {
            return "HARI RAYA"
        } else if (text === 'NEW_YEAR_DAY') {
            return "NEW YEAR DAY"
        } else if (text === 'BLACK_FRIDAY') {
            return "BLACK FRIDAY"
        } else if (text === 'CHRISTMAS') {
            return "CHRISTMAS"
        } else if (text === 'GOVERNMENT') {
            return "GOVERNMENT"
        } else {
            return text
        }
    }

    const formatDate = (date) => {
        let inputDate = new Date(date);
        let day = inputDate.getDate().toString().padStart(2, '0');
        let month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
        let year = inputDate.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const isSaved = (deal_id) => {
        const savedList = user.deals_list ? user.deals_list.map((deal) => deal_id === deal.deal_id) : [false];
        console.log(savedList)
        return savedList.includes(true)
    }
    const save = async (deal_id) => {
        console.log('inside toggle')
        let response = await toggleSaveDeal(user.user_id, deal_id);
        console.log(isSaved(deal_id))
        if (response.status) {
            if (!isSaved(deal_id)) {
                let obj = {
                    ...user,
                    deals_list: response.data
                }
                await storeUser(obj);
                fetchUser();
                Toast.show({
                    type: 'success',
                    text1: 'Deal has been saved!'
                });
            } else {
                let obj = {
                    ...user,
                    deals_list: response.data
                }
                await storeUser(obj);
                fetchUser();
                Toast.show({
                    type: 'success',
                    text1: 'Deal has been unsaved!'
                });
            }

        } else {
            Toast.show({
                type: 'error',
                text1: response.info
            })
        }
    }

    return (
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

                    {data.map((item, index) => {
                        if (((userType === 'TOURIST' && !item.is_govt_voucher) || userType === 'LOCAL') && new Date(item.end_datetime) >= currentDate) {
                            return (
                                <Card key={index}>
                                    <View style={{ marginBottom: 20}} >
                                    {new Date(item.start_datetime) >= new Date()?
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ backgroundColor: 'orange', color: 'white', fontWeight: 'bold', alignSelf: 'center', padding: 10, width: '100%' }}>
                                            UPCOMING
                                        </Text>
                                    </View>:
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ backgroundColor: 'green', color: 'white', fontWeight: 'bold', alignSelf: 'center', padding: 10, width: '100%' }}>
                                            AVAILABLE
                                        </Text>
                                    </View>
                                    }
                                    </View>
                                    <Button mode="text" style={{ marginTop: -55, alignSelf: 'flex-end' }} onPress={() => save(item.deal_id)} >
                                        {isSaved(item.deal_id) && <Icon name="heart" size={20} color='red' />}
                                        {!isSaved(item.deal_id) && <Icon name="heart" size={20} color='grey' />}
                                    </Button>
                                    {item.deal_image_list.length > 0 ? (
                                        <Card.Image
                                            style={{ padding: 0, height: 200 }}
                                            source={{
                                                uri: item.deal_image_list[0] // KIV for image
                                            }}
                                        />
                                    ) : null}


                                    <Text style={styles.description}>
                                        <Text style={{ fontWeight: 'bold' }}>Start Date:</Text>  {formatDate(item.start_datetime)} {'\n'} {'\n'}
                                        <Text style={{ fontWeight: 'bold' }}>End Date:</Text> {formatDate(item.end_datetime)} {'\n'} {'\n'}
                                        <Text style={{ fontWeight: 'bold' }}>Promo Code:</Text> {item.promo_code}
                                    </Text>

                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={[styles.tag, { backgroundColor: 'blue', color: 'white', fontWeight: 'bold' }]}>
                                            {item.discount_percent} % for GRABS
                                        </Text>
                                        <Text style={[styles.tag, { backgroundColor: 'purple', color: 'white' }]}>
                                            {formatDealType(item.deal_type)}
                                        </Text>
                                    </View>
                                </Card>
                            );
                        } else {
                            return null;
                        }
                    })}

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isFilterModalVisible}
                        onRequestClose={toggleFilterModal}
                    >
                        <View style={styles.modalBackground}>
                            <View style={styles.modalContainer}>
                                <ScrollView>
                                    {/* Filter options go here */}
                                    <View style={styles.filterBox}>
                                        {/* Deal Type Filter */}
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Select Type...',
                                                value: null,
                                            }}
                                            onValueChange={(value) =>
                                                handleFilterSelect('dealType', value)
                                            }
                                            items={[
                                                { label: 'Chinese New Year', value: 'CHINESE_NEW_YEAR' },
                                                { label: 'National Day', value: 'NATIONAL_DAY' },
                                                { label: 'Deepavalli', value: 'DEEPAVALLI' },
                                                { label: 'NUS Wellbeing Day', value: 'NUS_WELLBEING_DAY' },
                                                { label: 'Singles Day', value: 'SINGLES_DAY' },
                                                { label: 'Valentines', value: 'VALENTINES' },
                                                { label: 'Hari Raya', value: 'HARI_RAYA' },
                                                { label: 'New Year Day', value: 'NEW_YEAR_DAY' },
                                                { label: 'Black Friday', value: 'BLACK_FRIDAY' },
                                                { label: 'Christmas', value: 'CHRISTMAS' },
                                                { label: 'Government', value: 'GOVERNMENT' },
                                            ]}
                                            value={dealTypeFilter}
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
        width: '45%',
        fontSize: 11,
        fontWeight: 'bold',
    },
    header: {
        color: '#044537',
        fontSize: 15
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

export default DealScreen