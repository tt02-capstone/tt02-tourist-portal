import React, { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { Text, Card } from '@rneui/themed';
import {getdDealListbyVendor, getPublishedDealList, toggleSaveDeal} from "../../redux/dealRedux";
import { getUser, getUserType, storeUser } from "../../helpers/LocalStorage";
import { deleteSavedAttraction } from "../../redux/reduxAttraction";
import Toast from "react-native-toast-message";
import { toggleSaveTelecom } from "../../redux/telecomRedux";
import { Button } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import RNPickerSelect from 'react-native-picker-select';
import {timeZoneOffset} from "../../helpers/DateFormat";
import {useIsFocused, useRoute} from "@react-navigation/native";

const ApplyDealScreen = ({ route, navigation }) => {
    const [data, setData] = useState([]);
    const [userType, setUserType] = useState('');
    const [user, setUser] = useState('');
    const [fullDealList, setFullDealList] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    // const [dealTypeFilter, setDealTypeFilter] = useState(null);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const { vendorId, dealId } = route.params;

    const isFocused = useIsFocused();
    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
        // console.log(userData)
        setUserType(await getUserType());
        // console.log(userType)
    }

    useEffect(() => {
        const fetchData = async () => {
            let response = await getdDealListbyVendor(vendorId);
            if (response.status) {
                console.log('dealId', dealId)
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
    }, [isFocused]);

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

        // console.log(filteredList);

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

    const getColorForType = (label) => {
        const labelColorMap = {
            'CHINESE_NEW_YEAR': 'firebrick',
            'NATIONAL_DAY': 'indianred',
            'DEEPAVALLI': 'indigo',
            'NUS_WELLBEING_DAY': 'darkcyan',
            'SINGLES_DAY': 'chocolate',
            'VALENTINES': 'mediumvioletred',
            'HARI_RAYA': 'darkolivegreen',
            'NEW_YEAR_DAY': 'goldenrod',
            'BLACK_FRIDAY': 'black',
            'CHRISTMAS': 'darkred',
            'GOVERNMENT': 'darkgray',
        };

        return labelColorMap[label] || 'gray';
    };

    const formatDate = (date) => {
        let inputDate = new Date(date);
        let day = inputDate.getDate().toString().padStart(2, '0');
        let month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
        let year = inputDate.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const isSaved = (deal_id) => {
        const savedList = user.deals_list ? user.deals_list.map((deal) => deal_id === deal.deal_id) : [false];
        // console.log(savedList)
        return savedList.includes(true)
    }
    const save = async (deal_id) => {
        // console.log('inside toggle')
        let response = await toggleSaveDeal(user.user_id, deal_id);
        // console.log(isSaved(deal_id))
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

                    <View>
                        <TouchableOpacity onPress={() => navigation.navigate("CartScreen", {vendorId: vendorId, dealId: 0 })} style={styles.filterButton}>
                            <Text style={styles.filterText}> Cancel Promo</Text>
                        </TouchableOpacity>
                    </View>

                    {data.map((item, index) => {
                        if (((userType === 'TOURIST' && !item.is_govt_voucher) || userType === 'LOCAL') && new Date(item.end_datetime) >= currentDate && new Date(item.start_datetime) <= new Date()) {
                            return (
                                <Card key={index}>
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
                                        <Text style={[styles.tag, { backgroundColor: 'midnightblue', color: 'white', fontWeight: 'bold', textAlign: 'center' }]}>
                                            {item.discount_percent} % for GRABS
                                        </Text>
                                        <Text style={[styles.tag, { backgroundColor: getColorForType(item.deal_type), color: 'white', textAlign: 'center' }]}>
                                            {formatDealType(item.deal_type)}
                                        </Text>
                                    </View>
                                    <Button mode="text" style={{ marginTop: 10, alignSelf: 'flex-end' }}
                                            onPress={() => navigation.navigate("CartScreen", {vendorId: vendorId, dealId: item.deal_id })} >
                                        {dealId === item.deal_id? (
                                            <Text style={{ backgroundColor: 'green', color: 'white', fontWeight: 'bold', alignSelf: 'center', padding: 10, width: '100%' }}>
                                                Promo Applied
                                            </Text>
                                        ):(
                                            <Text style={{ backgroundColor: 'blue', color: 'white', fontWeight: 'bold', alignSelf: 'center', padding: 10, width: '100%' }}>
                                                Apply Promo
                                            </Text>
                                            )
                                        }

                                    </Button>
                                </Card>
                            );
                        } else {
                            return null;
                        }
                    })}
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
        width: '70%',
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

export default ApplyDealScreen