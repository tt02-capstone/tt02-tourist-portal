import React , { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import Button from '../../components/Button';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, useWindowDimensions  } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getUser, getUserType, storeUser } from '../../helpers/LocalStorage';
import { getSavedAttractionList, deleteSavedAttraction } from '../../redux/reduxAttraction';
import { getAllSavedRestaurantForUser, removeSavedRestaurantForUser } from '../../redux/restaurantRedux';
import { getUserSavedTelecom, toggleSaveTelecom } from '../../redux/telecomRedux';
import { getUserSavedItems, toggleSaveItem } from '../../redux/itemRedux';
import Toast from "react-native-toast-message";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import {getUserSavedDeal, toggleSaveDeal} from "../../redux/dealRedux";
import {getAccommodationList, getUserSavedAccommodation, toggleSaveAccommodation} from "../../redux/reduxAccommodation";
import {useIsFocused} from "@react-navigation/native";
import Icon from 'react-native-vector-icons/FontAwesome';


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
                                uri: item.attraction_image_list[0]
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

const RestaurantRoute = ({data, removeListing, viewListing, getColorForType}) => (
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
                                    uri: item.restaurant_image_list[0]
                                }}
                            />

                            <Text style={styles.description}>{item.description}</Text>
                            <View style={{ flexDirection: 'row'}}>
                                <Text style={[styles.tag, {backgroundColor:getColorForType(item.restaurant_type)}]}>{item.restaurant_type}</Text>
                                <Text style={[styles.tag, {backgroundColor:'purple', color: 'white'}]}>{item.estimated_price_tier}</Text>
                            </View>

                            <View style={{ flexDirection: 'row'}}>
                                <Button style={styles.button} text = "REMOVE" mode="contained" onPress={() => removeListing(item.restaurant_id)} />
                                <Button style={styles.button} text = "VIEW MORE" mode="contained" onPress={() => viewListing(item.restaurant_id)}/>
                            </View>

                        </Card>
                    ))
                }
            </View>
        </ScrollView>
    </Background>
);

const AccommodationRoute =({ data, removeListing, viewListing, getColorForType }) => (
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
                                        uri: item.accommodation_image_list[0]
                                    }}
                                />

                                <Text style={styles.description}>{item.description}</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={[styles.tag, {backgroundColor: getColorForType(item.type)}]}>{item.type}</Text>
                                    <Text style={[styles.tag, {backgroundColor:'purple', color: 'white'}]}>{item.estimated_price_tier}</Text>
                                </View>
                                <View style={{ flexDirection: 'row'}}>
                                    <Button style={styles.button} text = "REMOVE" mode="contained" onPress={() => removeListing(item.accommodation_id)} />
                                    <Button style={styles.button} text = "VIEW MORE" mode="contained" onPress={() => viewListing(item.accommodation_id)}/>
                                </View>
                            </Card>
                    ))
                }
            </View>
        </ScrollView>
    </Background>
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
                            <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
                                <Button style={styles.button} text = "REMOVE" mode="contained" onPress={() => removeDealListing(item.deal_id)} />
                            </View>
                        </Card>
                    );
                })}
            </View>
        </ScrollView>
    </Background>
);

const ItemRoute = ({data, viewItemListing, removeItemListing}) => (
    <Background>
        <ScrollView>
            <View style={styles.container}>
                {
                    data.map((item, index) => (
                        <Card key={index} >
                        <View>
                            <Image source={{ uri: item.image }} style={{ width: 150, height: 150, marginLeft:80 }} />
                            <View style={{marginLeft: 10, marginTop:3}}>
                                <Text style={{ fontSize: 15 , fontWeight:'bold', marginTop:0, color:'#044537'}}> {item.name} </Text>
                                <Text style={{ fontSize: 11 , fontWeight:'bold', marginTop:3, color:'grey'}}> $ {item.price}.00 </Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row'}}>
                            <Button style={styles.button} text = "REMOVE" mode="contained" onPress={() => removeItemListing(item.item_id)} />
                            <Button style={styles.button} text = "VIEW MORE" mode="contained" onPress={() => viewItemListing(item.item_id)}/>
                        </View>
                    </Card>
                    ))
                }
            </View>
        </ScrollView>
    </Background>
);

const renderScene = SceneMap({
    first: AttractionRoute,
    second: RestaurantRoute,
    third: AccommodationRoute,
    fourth: TelecomRoute,
    fifth: DealRoute,
    sixth: ItemRoute
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

    // restaurant
    const [restData, setRestData] = useState([]);

    //accommodation
    const [accommodationData, setAccommodationData] =useState([]);

    //item
    const [itemData, setItemData] =useState([]);

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'first', title: 'Attr' },
        { key: 'second', title: 'Rest' },
        { key: 'third', title: 'Accom' },
        { key: 'fourth', title: 'Tele' },
        { key: 'fifth', title: 'Deals' },
        { key: 'sixth', title: 'Items' },
    ]);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
        setUserType(await getUserType());
    }

    async function updateData() {
        const savedAttractions = await getSavedAttractionList(user.user_id);
        setData(savedAttractions.data);

        const savedRest = await getAllSavedRestaurantForUser(user.user_id);
        setRestData(savedRest.data)
    }

    useEffect(() => {
        const fetchData = async() => {
            try {
                if (fetchData || isFocused) {
                    const userData = await getUser()
                    setUser(userData)

                    let savedAttractions = await getSavedAttractionList(userData.user_id);
                    if (savedAttractions.status) {    
                        setData(savedAttractions.data);
                    }

                    let telecomResponse = await getUserSavedTelecom(userData.user_id);
                    if (telecomResponse.status) {
                        setTelecomData(telecomResponse.data);
                    }

                    let dealResponse = await getUserSavedDeal(userData.user_id);
                    if (dealResponse.status) {
                        setDealData(dealResponse.data);
                    }

                    let savedRest = await getAllSavedRestaurantForUser(userData.user_id);
                    if (savedRest.status) {
                        setRestData(savedRest.data);
                    }

                    let savedAccommodations = await getUserSavedAccommodation(userData.user_id);
                    if (savedAccommodations.status) {
                        setAccommodationData(savedAccommodations.data);
                    }

                    let savedItems = await getUserSavedItems(userData.user_id);
                    if (savedItems.status) {
                        setItemData(savedItems.data);
                    }

                    setFetchData(false);
                }

            } catch (error) {
                alert ('An error occur! Failed to retrieve saved listing!');
            }    
        };
        fetchUser();
        fetchData();
    }, [fetchData, isFocused]);

    // attractions
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

    const getColorForTypeAccommodation = (label) => {
        const labelColorMap = {
            'HOTEL': 'lightblue',
            'AIRBNB': 'lightgreen',
        };

        return labelColorMap[label] || 'gray';
    };

    const viewListing = (attraction_id) => {
        navigation.navigate('AttractionDetailsScreen', {attractionId : attraction_id}); // set the attraction id here 
    }

    const viewAccommodationListing = (accommodation_id) => {
        navigation.navigate('AccommodationDetailsScreen', {accommodationId : accommodation_id}); 
    }

    // shopping items 
    const viewItemListing = (item_id) => {
        navigation.navigate('ItemDetailsScreen', {itemId : item_id}); 
    }

    const removeItemListing = async (item_id) => {
        let response = await toggleSaveItem(user.user_id, item_id);
        if (response.status) {
            let obj = {
                ...user,
                item_list: response.data
            }
            await storeUser(obj);
            fetchUser();
            setFetchData(true);
            Toast.show({
                type: 'success',
                text1: 'Listing has been removed!'
            });
        } else {
            console.log("Listing not removed!");
        }
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

    // telecom
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

    // restaurant
    const getColorForTypeRest = (label) => {
        const labelColorMap = {
            'KOREAN': 'lightblue',
            'MEXICAN': 'lightgreen',
            'CHINESE': 'orange',
            'WESTERN' : 'yellow',
            'FAST_FOOD' : 'turquoise',
            'JAPANESE' : 'lightpink'
          };

        return labelColorMap[label] || 'gray';
    };

    const viewRestListing = (restId) => {
        navigation.navigate('RestaurantDetailsScreen', {restId : restId}); // redirect to rest
    }

    const removeRestListing = async (restId) => {
        let response = await removeSavedRestaurantForUser(user.user_id, restId)
        if (response.status) {
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

    //deal
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
    const removeAccommodationListing = async (accommodation_id) => {
        let response = await toggleSaveAccommodation(user.user_id,accommodation_id);
        if (response.status) {
            let obj = {
                ...user,
                accommodation_list: response.data
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


    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={({ route }) => {
                switch (route.key) {
                    case 'first':
                        return <AttractionRoute data={data} removeListing={removeListing} viewListing={viewListing}  getColorForType={getColorForType}/>;
                    case 'second':
                        return <RestaurantRoute data={restData} removeListing={removeRestListing} viewListing={viewRestListing} getColorForType={getColorForTypeRest} />;
                    case 'third':
                        return <AccommodationRoute data={accommodationData} removeListing={removeAccommodationListing} viewListing={viewAccommodationListing} getColorForType={getColorForTypeAccommodation}/>;
                    case 'fourth':
                        return <TelecomRoute data={telecomData} viewTelecomListing={viewTelecomListing} removeTelecomListing={removeTelecomListing} />;
                    case 'fifth':
                        return <DealRoute userType={userType} data={dealData} removeDealListing={removeDealListing} />;
                    case 'sixth':
                        return <ItemRoute data={itemData} viewItemListing={viewItemListing} removeItemListing={removeItemListing} />;
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
                  labelStyle={{ fontSize: 9, fontWeight:'bold' }}
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
        width: "50%",
    }
});

export default SavedListingScreen