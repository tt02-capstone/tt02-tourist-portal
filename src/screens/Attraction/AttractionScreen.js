import React, { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { getAttractionList } from '../../redux/reduxAttraction';
import { clearStorage, getUser, getUserType } from '../../helpers/LocalStorage';
import RNPickerSelect from 'react-native-picker-select';

const AttractionScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fullAttractionList, setFullAttractionList] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [attractionCategoryFilter, setAttractionCategoryFilter] = useState(null);
    const [genericLocationFilter, setGenericLocationFilter] = useState(null);
    const [priceTierFilter, setPriceTierFilter] = useState(null);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)

        const usertype = await getUserType()
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                let listOfAttractions = await getAttractionList();
                console.log("listOfAttractions", listOfAttractions);
                setData(listOfAttractions);
                setFullAttractionList(listOfAttractions);
                setLoading(false);
            } catch (error) {
                alert('An error occur! Failed to retrieve attraction list!');
                setLoading(false);
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
            case 'attractionCategory':
                setAttractionCategoryFilter(filterValue);
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
        setAttractionCategoryFilter(null);
        setGenericLocationFilter(null);
        setPriceTierFilter(null);
        setTimeout(() => {
            setData(fullAttractionList);
        }, 10);
    };

    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const applyFilters = () => {
        let filteredList = fullAttractionList;

        for (const filter of selectedFilters) {
            switch (filter.type) {
                case 'attractionCategory':
                    filteredList = filteredList.filter(item => item.attraction_category === filter.value);
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

    const viewAttraction = (attraction_id) => {
        navigation.navigate('AttractionDetailsScreen', { attractionId: attraction_id }); // set the attraction id here 
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
                        <TouchableOpacity key={index} onPress={() => viewAttraction(item.attraction_id)}>
                            <Card>
                                <Card.Title style={styles.header}>
                                    {item.name}
                                </Card.Title>
                                <Card.Image
                                    style={{ padding: 0 }}
                                    source={{
                                        uri: item.attraction_image_list[0] // KIV for image 
                                    }}
                                />

                                <Text style={styles.description}>{item.description}</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={[styles.tag, { backgroundColor: getColorForType(item.attraction_category) }]}>{item.attraction_category}</Text>
                                    <Text style={[styles.tag, { backgroundColor: 'purple', color: 'white' }]}>{item.estimated_price_tier}</Text>
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
                                        {/* Attraction Category Filter */}
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Select Type...',
                                                value: null,
                                            }}
                                            onValueChange={(value) =>
                                                handleFilterSelect('attractionCategory', value)
                                            }
                                            items={[
                                                { label: 'Historical', value: 'HISTORICAL' },
                                                { label: 'Cultural', value: 'CULTURAL' },
                                                { label: 'Nature', value: 'NATURE' },
                                                { label: 'Adventure', value: 'ADVENTURE' },
                                                { label: 'Shopping', value: 'SHOPPING' },
                                                { label: 'Entertainment', value: 'ENTERTAINMENT' },
                                            ]}
                                            value={attractionCategoryFilter}
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
        width: 90,
        fontSize: 7.5,
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

export default AttractionScreen