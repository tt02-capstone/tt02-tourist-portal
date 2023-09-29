import React , { useState, useEffect } from 'react';
import { useIsFocused } from "@react-navigation/native";
import Background from '../../components/CardBackground';
import Button from '../../components/Button';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, useWindowDimensions  } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { getUser, getUserType, storeUser } from '../../helpers/LocalStorage';
import { getSavedAttractionList, deleteSavedAttraction } from '../../redux/reduxAttraction';
import { getUserSavedTelecom, toggleSaveTelecom } from '../../redux/telecomRedux';
import Toast from "react-native-toast-message";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import {getUserSavedDeal, toggleSaveDeal} from "../../redux/dealRedux";

const AttractionRoute = ({ data, removeListing, viewListing, getColorForType }) => (
    <Background>
        <ScrollView>
            <View style={styles.container}>
                { 
                    data.map((item, index) => (
                        <Card key={index}>
                            <Card.Title style={styles.header}>
                                {item.name} 
                            </Card.Title>
                            <Card.Image
                                style={{ padding: 0}}
                                source={{
                                uri: item.attraction_image_list[0] // KIV for image 
                                }}
                            />

                            <Text style={styles.description}>{item.description}</Text>
                            <View style={{ flexDirection: 'row'}}>
                                <Text style={[styles.tag, {backgroundColor:getColorForType(item.attraction_category)}]}>{item.attraction_category}</Text>
                                <Text style={[styles.tag, {backgroundColor:'purple', color: 'white'}]}>{item.estimated_price_tier}</Text>
                            </View>

                            <View style={{ flexDirection: 'row'}}>
                                <Button style={styles.button} text = "REMOVE" mode="contained" onPress={() => removeListing(item.attraction_id)} />
                                <Button style={styles.button} text = "VIEW MORE" mode="contained" onPress={() => viewListing(item.attraction_id)}/>
                            </View>

                        </Card>
                    )) 
                }
            </View>
        </ScrollView>
    </Background>
);

const RestaurantRoute = () => (
    <View style={{ flex: 1, backgroundColor: 'white' }} />
);

const AccomodationRoute = () => (
    <View style={{ flex: 1, backgroundColor: 'white' }} />
);

function formatTelecomImage(text) {
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

const TelecomRoute = ({data, viewTelecomListing, removeTelecomListing}) => (
    <Background>
        <ScrollView>
            <View style={styles.container}>
                {
                    data.map((item, index) => (
                        <Card key={index}>
                            <Card.Title style={styles.header}>
                                {item.name} 
                            </Card.Title>
                            <Card.Image
                                style={{ padding: 0, height: 200, marginBottom: 20}}
                                source={{
                                uri: formatTelecomImage(item.plan_duration_category) 
                                }}
                            />

                            <Text style={styles.subtitle}>
                                <Text style={{fontWeight: 'bold'}}>Price: </Text><Text>${item.price} </Text>
                                <Text style={{fontWeight: 'bold'}}>Duration: </Text><Text>{item.num_of_days_valid} day(s) </Text>
                                <Text style={{fontWeight: 'bold'}}>Data Limit: </Text><Text>{item.data_limit}GB</Text>
                            </Text>

                            <Text style={styles.description}>{item.description}</Text>

                            <View style={{ flexDirection: 'row'}}>
                                <Button style={styles.button} text = "REMOVE" mode="contained" onPress={() => removeTelecomListing(item.telecom_id)} />
                                <Button style={styles.button} text = "VIEW MORE" mode="contained" onPress={() => viewTelecomListing(item.telecom_id)}/>
                            </View>
                        </Card>
                    ))
                }
            </View>
        </ScrollView>
    </Background>
);

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
const DealRoute = ({userType, data, removeDealListing}) => (
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
                                <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
                                    <Button style={styles.button} text = "REMOVE" mode="contained" onPress={() => removeDealListing(item.deal_id)} />
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
);

const renderScene = SceneMap({
    first: AttractionRoute,
    second: RestaurantRoute,
    third: AccomodationRoute,
    fourth: TelecomRoute,
    fifth: DealRoute
});

const SavedListingScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const layout = useWindowDimensions();
    const isFocused = useIsFocused(); // to call useEffect whenever the page is seen regardless of on top of stack

    // attraction
    const [data, setData] = useState([]);

    //deal
    const [dealData, setDealData] = useState([]);

    // telecom
    const [telecomData, setTelecomData] = useState([]);
    const [fetchData, setFetchData] = useState(true);
    const [userType, setUserType] = useState('');

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'first', title: 'Attraction' },
        { key: 'second', title: 'Restaurant' },
        { key: 'third', title: 'Accoms' },
        { key: 'fourth', title: 'Telecom' },
        { key: 'fifth', title: 'Deals' },
    ]);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
        setUserType(await getUserType());
    }

    async function updateData() {
        const savedAttractions = await getSavedAttractionList(user.user_id);
        setData(savedAttractions);
    }

    useEffect(() => {
        const fetchData = async() => {
            try {
                if (fetchData || isFocused) {
                    const userData = await getUser()
                    setUser(userData)
    
                    let savedAttractions = await getSavedAttractionList(userData.user_id);
                    setData(savedAttractions);
    
                    let telecomResponse = await getUserSavedTelecom(userData.user_id);
                    if (telecomResponse.status) {
                        setTelecomData(telecomResponse.data);
                    }

                    let dealResponse = await getUserSavedDeal(userData.user_id);
                    if (dealResponse.status) {
                        setDealData(dealResponse.data);
                    }
                    
                    setFetchData(false);
                }

            } catch (error) {
                alert ('An error occur! Failed to retrieve saved attraction listing!');
            }    
        };
        fetchUser();
        fetchData();
    }, [fetchData, isFocused]);

    const getColorForType = (label) => {
        const labelColorMap = {
          'HISTORICAL': 'lightblue',
          'CULTURAL': 'lightgreen',
          'NATURE': 'orange',
          'ADVENTURE' : 'yellow',
          'SHOPPING' : 'turquoise',
          'ENTERTAINMENT' : 'lightpink'
        };

        return labelColorMap[label] || 'gray';
    };

    const viewListing = (attraction_id) => {
        navigation.navigate('AttractionDetailsScreen', {attractionId : attraction_id}); // set the attraction id here 
    }

    const removeListing = async (attraction_id) => {
        let response = await deleteSavedAttraction(user.user_id,attraction_id);
        if (!response.status) {
            await storeUser(response.info); // update the user in local storage 
            fetchUser();
            Toast.show({
                type: 'success',
                text1: 'Listing has been removed!'
            });

            updateData();
        } else {
            Toast.show({
                type: 'error',
                text1: response.info
            })
        }
    }

    const viewTelecomListing = (id) => {
        navigation.navigate('TelecomDetailsScreen', {id: id});
    }

    const removeTelecomListing = async (id) => {
        let response = await toggleSaveTelecom(user.user_id, id);
        if (response.status) {
            let obj = {
                ...user,
                telecom_list: response.data
            }
            await storeUser(obj); 
            fetchUser();
            setFetchData(true);
            Toast.show({
                type: 'success',
                text1: 'Listing has been removed!'
            });

            updateData();
        } else {
            console.log("Telecom not removed!");
        }
    }

    const removeDealListing = async (id) => {
        let response = await toggleSaveDeal(user.user_id, id);
        if (response.status) {
            let obj = {
                ...user,
                deals_list: response.data
            }
            await storeUser(obj);
            fetchUser();
            setFetchData(true);
            Toast.show({
                type: 'success',
                text1: 'Deal has been removed!'
            });

            updateData();
        } else {
            console.log("Deal not removed!");
        }
    }
    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={({ route }) => {
                switch (route.key) {
                    case 'first':
                        return <AttractionRoute data={data} removeListing={removeListing} viewListing={viewListing}  getColorForType={getColorForType}/>;
                    case 'second':
                        return <RestaurantRoute />;
                    case 'third':
                        return <AccomodationRoute />;
                    case 'fourth':
                        return <TelecomRoute data={telecomData} viewTelecomListing={viewTelecomListing} removeTelecomListing={removeTelecomListing} />;
                    case 'fifth':
                        return <DealRoute userType={userType} data={dealData} removeDealListing={removeDealListing} />;
                    default:
                        return null;
                }
              }}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={props => (
                <TabBar
                  {...props}
                  indicatorStyle={{ backgroundColor: 'white' }} // the line below the tab
                  style={{ backgroundColor: 'rgba(4, 69, 55, 0.85)', height: 50  }} 
                  labelStyle={{ fontSize: 6, fontWeight:'bold' }}
                />
            )}
        />
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
      flexDirection: 'row',marginBottom: 6,
    },
    image: {
      width: 30,height: 30,marginRight: 10,
    },
    name: {
      fontSize: 16,marginTop: 5,
    },
    description: {
      marginBottom: 20, fontSize: 13, marginTop : 10 
    },
    tag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 110,
        fontSize: 11,
        fontWeight: 'bold'
    },
    header:{
        color: '#044537',
        fontSize: 15
    },
    button: {
        width: "50%"
    }
});

export default SavedListingScreen