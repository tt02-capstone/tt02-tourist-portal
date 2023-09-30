import React, {useState, useEffect} from 'react';
import Background from '../../components/CardBackground';
import {View, ScrollView, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {Text, Card} from '@rneui/themed';
import {getPublishedDealList, toggleSaveDeal} from "../../redux/dealRedux";
import {getUser, getUserType, storeUser} from "../../helpers/LocalStorage";
import {deleteSavedAttraction} from "../../redux/reduxAttraction";
import Toast from "react-native-toast-message";
import {toggleSaveTelecom} from "../../redux/telecomRedux";
import {Button} from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";

const DealScreen = ({navigation}) => {
    const [data, setData] = useState([]);
    const [userType, setUserType] = useState('');
    const [user, setUser] = useState('');

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
                console.log(response.data)
                setData(response.data);
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
        const savedList = user.deals_list? user.deals_list.map((deal) => deal_id === deal.deal_id): [false];
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
                    {data.map((item, index) => {
                        if ((userType === 'TOURIST' && !item.is_govt_voucher) || userType === 'LOCAL') {
                            return (
                                    <Card key={index}>
                                        <Card.Title style={styles.header}>
                                            {item.promo_code ? item.promo_code : 'NO PROMO CODE REQUIRED'}
                                        </Card.Title>
                                        <Button mode="text" style={{ marginTop: -45, alignSelf: 'flex-end'}} onPress={() => save(item.deal_id)} >
                                            {isSaved(item.deal_id) && <Icon name="heart" size={20} color='red' />}
                                            {!isSaved(item.deal_id) && <Icon name="heart" size={20} color='grey'/>}
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
                                            <Text style={[styles.tag, { backgroundColor: 'green', color: 'white', fontWeight: 'bold' }]}>
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
        width: '45%',
        fontSize: 11,
        fontWeight: 'bold',
    },
    header: {
        color: '#044537',
        fontSize: 15
    }
});

export default DealScreen