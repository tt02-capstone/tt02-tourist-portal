import React, { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { getPublishedTelecomList } from '../../redux/telecomRedux';
import RNPickerSelect from 'react-native-picker-select';

const TelecomScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [data, setData] = useState([]);
    const [fullTelecomList, setFullTelecomList] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [telecomTypeFilter, setTelecomTypeFilter] = useState(null);
    const [priceTierFilter, setPriceTierFilter] = useState(null);
    const [numOfValidDaysFilter, setNumOfValidDaysFilter] = useState(null);
    const [gBLimitFilter, setGBLimitFilter] = useState(null);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)

        const usertype = await getUserType()
    }

    useEffect(() => {
        const fetchData = async () => {
            let response = await getPublishedTelecomList();
            if (response.status) {
                setData(response.data);
                setFullTelecomList(response.data);
            } else {
                console.log("Telecom list not fetch!");
            }
        };

        fetchUser();
        fetchData();
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
            case 'telecomType':
                setTelecomTypeFilter(filterValue);
                break;
            case 'priceTier':
                setPriceTierFilter(filterValue);
                break;
            case 'numOfValidDays':
                setNumOfValidDaysFilter(filterValue);
                break;
            case 'gBLimit':
                setGBLimitFilter(filterValue);
                break;
            default:
                break;
        }
    };

    const clearFilters = () => {
        setSelectedFilters([]);
        setTelecomTypeFilter(null);
        setPriceTierFilter(null);
        setNumOfValidDaysFilter(null);
        setGBLimitFilter(null);
        setTimeout(() => {
            setData(fullTelecomList);
        }, 10);
    };

    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const applyFilters = () => {
        let filteredList = fullTelecomList;

        for (const filter of selectedFilters) {
            switch (filter.type) {
                case 'telecomType':
                    filteredList = filteredList.filter(item => item.type === filter.value);
                    break;
                case 'priceTier':
                    filteredList = filteredList.filter(item => item.estimated_price_tier === filter.value);
                    break;
                case 'numOfValidDays':
                    filteredList = filteredList.filter(item => item.plan_duration_category === filter.value);
                    break;
                case 'gBLimit':
                    filteredList = filteredList.filter(item => item.data_limit_category === filter.value);
                    break;
                default:
                    break;
            }
        }

        setData(filteredList);
        toggleFilterModal();
    };

    const viewTelecomDetails = (id) => {
        navigation.navigate('TelecomDetailsScreen', { id: id }); // set the attraction id here 
    }

    function formatImage(text) {
        if (text === 'ONE_DAY') {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/telecom/telecom_1_day.JPG';
        } else if (text === 'THREE_DAY') {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/telecom/telecom_3_day.JPG';
        } else if (text === 'SEVEN_DAY') {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/telecom/telecom_7_day.JPG';
        } else if (text === 'FOURTEEN_DAY') {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/telecom/telecom_14_day.JPG';
        } else if (text === 'MORE_THAN_FOURTEEN_DAYS') {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/telecom/telecom_more_than_14_day.JPG';
        } else {
            return text;
        }
    }

    function formatEstimatedPriceTier(text) {
        if (text === 'TIER_1') {
            return '$';
        } else if (text === 'TIER_2') {
            return '$$';
        } else if (text === 'TIER_3') {
            return '$$$';
        } else if (text === 'TIER_4') {
            return '$$$$';
        } else if (text === 'TIER_5') {
            return '$$$$$';
        } else {
            return text;
        }
    }

    function formatDurationCategory(text) {
        if (text === 'ONE_DAY') {
            return '1 Day';
        } else if (text === 'THREE_DAY') {
            return '3 Days';
        } else if (text === 'SEVEN_DAY') {
            return '7 Days';
        } else if (text === 'FOURTEEN_DAY') {
            return '14 Days';
        } else if (text === 'MORE_THAN_FOURTEEN_DAYS') {
            return '> 14 Days';
        } else {
            return text;
        }
    }

    function formatDataLimitCategory(text) {
        if (text === 'VALUE_10') {
            return '10GB';
        } else if (text === 'VALUE_30') {
            return '30GB';
        } else if (text === 'VALUE_50') {
            return '50GB';
        } else if (text === 'VALUE_100') {
            return '100GB';
        } else if (text === 'UNLIMITED') {
            return 'Unlimited';
        } else {
            return text;
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

                    {data.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => viewTelecomDetails(item.telecom_id)}>
                            <Card>
                                <Card.Title style={styles.header}>
                                    {item.name}
                                </Card.Title>
                                <Card.Image
                                    style={{ padding: 0, height: 200 }}
                                    source={{
                                        uri: formatImage(item.plan_duration_category)
                                    }}
                                />

                                <Text style={styles.description}>
                                    <Text style={{ fontWeight: 'bold' }}>Price: </Text><Text>${item.price}     </Text>
                                    <Text style={{ fontWeight: 'bold' }}>Duration: </Text><Text>{item.num_of_days_valid} day(s)    </Text>
                                    <Text style={{ fontWeight: 'bold' }}>Data Limit: </Text><Text>{item.data_limit}GB</Text>
                                </Text>
                                <Text style={styles.description}>{item.description}</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={[styles.tag, { backgroundColor: 'purple', color: 'white' }]}>{formatEstimatedPriceTier(item.estimated_price_tier)}</Text>
                                    <Text style={[styles.tag, { backgroundColor: 'blue', color: 'white' }]}>{formatDurationCategory(item.plan_duration_category)}</Text>
                                    <Text style={[styles.tag, { backgroundColor: 'green', color: 'white' }]}>{formatDataLimitCategory(item.data_limit_category)}</Text>
                                </View>
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
                                    {/* Filter options go here */}
                                    <View style={styles.filterBox}>
                                        {/* Accommodation Type Filter */}
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Select Type...',
                                                value: null,
                                            }}
                                            onValueChange={(value) =>
                                                handleFilterSelect('telecomType', value)
                                            }
                                            items={[
                                                { label: 'e-SIM', value: 'ESIM' },
                                                { label: 'Physical SIM', value: 'PHYSICALSIM' },
                                            ]}
                                            value={telecomTypeFilter}
                                            style={pickerSelectStyles}
                                        />
                                        {/* Estimated Price Tier Filter */}
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Select Price Tier...',
                                                value: null,
                                            }}
                                            onValueChange={(value) => handleFilterSelect('priceTier', value)}
                                            items={[
                                                { label: '$', value: 'TIER_1' },
                                                { label: '$$', value: 'TIER_2' },
                                                { label: '$$$', value: 'TIER_3' },
                                                { label: '$$$$', value: 'TIER_4' },
                                                { label: '$$$$$', value: 'TIER_5' },
                                            ]}
                                            value={priceTierFilter}
                                            style={pickerSelectStyles}
                                        />
                                         <RNPickerSelect
                                            placeholder={{
                                                label: 'Select Num Of Valid Days...',
                                                value: null,
                                            }}
                                            onValueChange={(value) => handleFilterSelect('numOfValidDays', value)}
                                            items={[
                                                { label: '1 Day', value: 'ONE_DAY' },
                                                { label: '3 Days', value: 'THREE_DAY' },
                                                { label: '7 Days', value: 'SEVEN_DAY' },
                                                { label: '14 Days', value: 'FOURTEEN_DAY' },
                                                { label: '> 14 Days', value: 'MORE_THAN_FOURTEEN_DAYS' },
                                            ]}
                                            value={numOfValidDaysFilter}
                                            style={pickerSelectStyles}
                                        />
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Select Data Limit Category...',
                                                value: null,
                                            }}
                                            onValueChange={(value) => handleFilterSelect('gBLimit', value)}
                                            items={[
                                                { label: '10GB', value: 'VALUE_10' },
                                                { label: '30GB', value: 'VALUE_30' },
                                                { label: '50GB', value: 'VALUE_50' },
                                                { label: '100GB', value: 'VALUE_100' },
                                                { label: 'Unlimited', value: 'UNLIMITED' },
                                            ]}
                                            value={gBLimitFilter}
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
        width: 100,
        fontSize: 11,
        fontWeight: 'bold'
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

export default TelecomScreen