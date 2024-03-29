import React, { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getRestaurantList } from '../../redux/restaurantRedux';
import { getUser } from '../../helpers/LocalStorage';
import RNPickerSelect from 'react-native-picker-select';

const RestaurantScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fullRestaurantList, setFullRestaurantList] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [restaurantTypeFilter, setRestaurantTypeFilter] = useState(null);
    const [genericLocationFilter, setGenericLocationFilter] = useState(null);
    const [priceTierFilter, setPriceTierFilter] = useState(null);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                let listofRest = await getRestaurantList();
                if (listofRest.status) {
                    setData(listofRest.data);
                    setFullRestaurantList(listofRest.data);
                }
                setLoading(false);
            } catch (error) {
                alert('An error occur! Failed to retrieve restaurant list!');
                setLoading(false);
            }
        };
        fetchUser();
        fetchData();
    }, []);

    const getColorForType = (label) => {
        const labelColorMap = {
            'KOREAN': 'lightblue',
            'MEXICAN': 'lightgreen',
            'CHINESE': 'orange',
            'WESTERN': 'gold',
            'FAST_FOOD': 'turquoise',
            'JAPANESE': 'lightpink'
        };

        return labelColorMap[label] || 'gray';
    };

    const viewRestaurant = (restId) => {
        navigation.navigate('RestaurantDetailsScreen', { restId: restId }); // set the rest id to bring to the nxt page 
    }

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
            case 'restaurantType':
                setRestaurantTypeFilter(filterValue);
                break;
            case 'genericLocation':
                setGenericLocationFilter(filterValue);
                break;
            case 'priceTier':
                setPriceTierFilter(filterValue);
                break;
            default:
                break;
        }
    };

    const clearFilters = () => {
        setSelectedFilters([]);
        setRestaurantTypeFilter(null);
        setGenericLocationFilter(null);
        setPriceTierFilter(null);
        setTimeout(() => {
            setData(fullRestaurantList);
        }, 10);
    };

    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const applyFilters = () => {
        let filteredList = fullRestaurantList;

        for (const filter of selectedFilters) {
            switch (filter.type) {
                case 'restaurantType':
                    filteredList = filteredList.filter(item => item.restaurant_type === filter.value);
                    break;
                case 'genericLocation':
                    filteredList = filteredList.filter(item => item.generic_location === filter.value);
                    break;
                case 'priceTier':
                    filteredList = filteredList.filter(item => item.estimated_price_tier === filter.value);
                    break;
                default:
                    break;
            }
        }

        setData(filteredList);
        toggleFilterModal();
    };

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
                        <TouchableOpacity key={index} onPress={() => viewRestaurant(item.restaurant_id)}>
                            <Card>
                                <Card.Title style={styles.header}>
                                    {item.name}
                                </Card.Title>
                                <Card.Image
                                    style={{ padding: 0 }}
                                    source={{
                                        uri: item.restaurant_image_list[0] // KIV for image 
                                    }}
                                />
                                <Text style={styles.description}>{item.description}</Text>
                                <View style={styles.tagContainer}>
                                    <Text style={[ styles.tag,{ backgroundColor: getColorForType(item.restaurant_type) },{ textAlign: 'center' }]}>
                                        {item.restaurant_type.replace(/_/g, ' ')}
                                    </Text>
                                    <Text style={[styles.tag,{ backgroundColor: 'purple', color: 'white' },{ textAlign: 'center' }]}>
                                        {item.estimated_price_tier.replace(/_/g, ' ')}
                                    </Text>
                                    <Text style={[ styles.locationTag,{ backgroundColor: 'green', color: 'white', textAlign: 'center' }]}>
                                        {item.generic_location.replace(/_/g, ' ')}
                                    </Text>
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
                                        {/* Restaurant Type Filter */}
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Select Type...',
                                                value: null,
                                            }}
                                            onValueChange={(value) =>
                                                handleFilterSelect('restaurantType', value)
                                            }
                                            items={[
                                                { label: 'Korean', value: 'KOREAN' },
                                                { label: 'Mexican', value: 'MEXICAN' },
                                                { label: 'Chinese', value: 'CHINESE' },
                                                { label: 'Western', value: 'WESTERN' },
                                                { label: 'Fast Food', value: 'FAST_FOOD' },
                                                { label: 'Japanese', value: 'JAPANESE' },
                                            ]}
                                            value={restaurantTypeFilter}
                                            style={pickerSelectStyles}
                                        />
                                        {/* Generic Location Filter */}
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Select Location...',
                                                value: null,
                                            }}
                                            onValueChange={(value) =>
                                                handleFilterSelect('genericLocation', value)
                                            }
                                            items={[
                                                { label: 'Marina Bay', value: 'MARINA_BAY' },
                                                { label: 'Raffles Place', value: 'RAFFLES_PLACE' },
                                                { label: 'Shenton Way', value: 'SHENTON_WAY' },
                                                { label: 'Tanjong Pagar', value: 'TANJONG_PAGAR' },
                                                { label: 'Orchard', value: 'ORCHARD' },
                                                { label: 'Newton', value: 'NEWTON' },
                                                { label: 'Dhoby Ghaut', value: 'DHOBY_GHAUT' },
                                                { label: 'Chinatown', value: 'CHINATOWN' },
                                                { label: 'Bugis', value: 'BUGIS' },
                                                { label: 'Clarke Quay', value: 'CLARKE_QUAY' },
                                                { label: 'Sentosa', value: 'SENTOSA' },
                                            ]}
                                            value={genericLocationFilter}
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
                                                { label: 'Tier 1', value: 'TIER_1' },
                                                { label: 'Tier 2', value: 'TIER_2' },
                                                { label: 'Tier 3', value: 'TIER_3' },
                                                { label: 'Tier 4', value: 'TIER_4' },
                                                { label: 'Tier 5', value: 'TIER_5' },
                                            ]}
                                            value={priceTierFilter}
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
        width: 80,
        fontSize: 9.5,
        fontWeight: 'bold',
    },
    locationTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 100,
        fontSize: 10,
        fontWeight: 'bold',
    },
    tagContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 5,
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

export default RestaurantScreen