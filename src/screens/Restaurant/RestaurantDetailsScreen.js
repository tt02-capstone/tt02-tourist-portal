import React , { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import { Button } from 'react-native-paper';
import { theme } from '../../core/theme'
import { getUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Text, Card } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getRestaurantById, saveRestaurantForUser , getRestaurantDish, getAllSavedRestaurantForUser , removeSavedRestaurantForUser} from '../../redux/restaurantRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { useIsFocused } from "@react-navigation/native";
import AttractionRecom from '../Recommendation/AttractionRecom';
import RestaurantRecom from '../Recommendation/RestaurantRecom';
import AccommodationRecom from '../Recommendation/AccommodationRecom';
import { getRecommendation } from '../../redux/recommendationRedux';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { getItineraryByUser } from '../../redux/itineraryRedux';

const RestaurantDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [restaurant, setRestaurant] = useState([]);
    const [dishList, setDishList] = useState([]);
    const [imgList, setImgList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const isFocused = useIsFocused();
    const route = useRoute();
    const { restId } = route.params;
    const [recommendation, setRecommendation] = useState([]);
    const [imageActiveSlide, setImageActiveSlide] = useState(0);

    // itinerary
    const [itinerary, setItinerary] = useState(null);
    const [showModal, setShowModal] = useState(false);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    async function fetchItinerary() {
        const response = await getItineraryByUser(user.user_id);
        if (response.status) {
            setItinerary(response.data);
        } else {
            console.log("itinerary not created / found!");
        }
    }

    const getRestaurant = async () => {        
        let response = await getRestaurantById(restId);
        if (response.status) {
            let restaurant = response.data;
            setRestaurant(restaurant);
            setImgList(restaurant.restaurant_image_list);

            let dishes = await getRestaurantDish(restId)

            if (dishes.status && dishes.data.length != 0) {
                const groupedDishes = dishes.data.reduce((acc, dish) => {
                    const type = dish.dish_type;
                
                    if (!acc[type]) {
                        acc[type] = [];
                    }
                
                    acc[type].push(dish);
                    return acc;
                }, {});
    
                setDishList(groupedDishes);
            } 

            let recoms = await getRecommendation(restaurant.generic_location, restaurant.listing_type, restId);
            if (recoms.status) {
                setRecommendation(recoms.data)
            }

        } else {
            console.log("Restaurant not fetched!");
        }
        setLoading(false);
    }

    // factor for recommendations 
    const viewRecommendedAttraction = (redirect_attraction_id) => {
        navigation.push('AttractionDetailsScreen', { attractionId: redirect_attraction_id }); 
    }

    const viewRecommendedRest = (redirect_rest_id) => {
        navigation.push('RestaurantDetailsScreen', { restId: redirect_rest_id });
    }

    const viewRecommendedAccom = (redirect_accom_id) => {
        navigation.push('AccommodationDetailsScreen', { accommodationId: redirect_accom_id });
    }

    const handleItemClick = (item) => {
        if (item.listing_type === "ATTRACTION") {
            viewRecommendedAttraction(item.attraction_id);
        } else if (item.listing_type === "RESTAURANT") {
            viewRecommendedRest(item.restaurant_id);
        } else if (item.listing_type === "ACCOMMODATION") {
            viewRecommendedAccom(item.accommodation_id);
        }
    }

    const showDishList = Object.keys(dishList).map(type => (
        <Card key={type}>
            <View style={{ width: 305 }}>
                <Text style={styles.header}>{type}</Text>
                {dishList[type].map(dish => (
                    <View key={dish.dish_id} style={{ flexDirection: 'row', alignItems: 'center'}}>
                        <View style={{ marginTop:10, width:220,flexDirection: 'row'}}>
                            <Text style={{fontSize:12}}>{dish.name}</Text>
                            
                            {/* buffer space */}
                            <Text> </Text> 

                            {dish.spicy && <Text style={{ fontSize: 8, color: 'red' , fontWeight:'bold', marginTop:2}}> 
                            <Icon name="fire" size={10} />
                            </Text>}
                            
                            {/* buffer space */}
                            <Text> </Text> 
                            
                            {dish.is_signature && <Text style={{ fontSize: 8, color: 'blue' , fontWeight:'bold', marginTop:2}}> 
                            <Icon name="thumbs-up" size={10} color='#044537'/>
                            </Text>}
                        </View>
                        <Text style={{marginLeft: 50, marginTop:10, fontSize:12, fontWeight:'bold'}}> $ {dish.price}</Text>
                    </View>
                ))}
            </View>
        </Card>
    ));

    useEffect(() => {
        if (isFocused) {
            setLoading(true);
            fetchUser();
            getRestaurant();
        }
    }, [isFocused]);

    useEffect(() => {
        if (user) {
            const fetchSaved = async () => {
                let saved = false;
                let check = await getAllSavedRestaurantForUser(user.user_id);
                if (check.data.length) {
                    for (var i = 0; i < check.data.length; i++) {
                        if(check.data[i].restaurant_id == restId) {
                            saved = true;
                            break;
                        } 
                    }
                    setIsSaved(saved);
                }
            }

            fetchSaved();
            fetchItinerary();
        }
    }, [user])

    const saveRest = async () => {
        if (!isSaved) {
            let response = await saveRestaurantForUser(user.user_id, restaurant.restaurant_id);
            if (response.status) {
                setIsSaved(true);
                fetchUser();
                Toast.show({
                    type: 'success',
                    text1: 'Restaurant has been saved!'
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
            }
        } else {
            // remove saved listing here 
            let response = await removeSavedRestaurantForUser(user.user_id, restaurant.restaurant_id);
            if (response.status) {
                setIsSaved(false);
                fetchUser();
                Toast.show({
                    type: 'success',
                    text1: 'Restaurant has been unsaved!'
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
            }
        }
    }

    renderCarouselItem = ({ item }) => (
        <View>
            <Card.Image
                style={styles.cardImage}
                source={{ uri: item }}
            />
        </View>
    );

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

    const onItineraryPressed = () => {
        if (itinerary) {
            navigation.navigate('CreateRestaurantDIYEventScreen', { typeId: restaurant.restaurant_id });
        } else {
            setShowModal(true); // show cannot navigate modal
        }
    }

    return (
        <Background>
                <ScrollView>
                    <Card>
                        <Card.Title style={styles.header}>
                            {restaurant.name} 
                            <Button mode="text" style={{ marginTop: -13, marginRight: -15}} onPress={saveRest} >
                                {isSaved && <Icon name="heart" size={20} color='red' />}
                                {!isSaved && <Icon name="heart" size={20} color='grey'/>}
                            </Button>
                            <Button mode="text" style={{ marginTop: -13, marginLeft: -5 }} onPress={onItineraryPressed} >
                                <Icon name="calendar" size={20} color='grey' />
                            </Button>
                        </Card.Title>

                        <View style={styles.tagContainer}>
                            <Text style={[ styles.typeTag,{ backgroundColor: getColorForType(restaurant.restaurant_type)},{ textAlign: 'center' }]}>
                                {restaurant.restaurant_type}
                            </Text>
                            <Text style={[styles.tierTag,{ backgroundColor: 'purple', color: 'white' },{ textAlign: 'center' },]}>
                                {restaurant.estimated_price_tier ? restaurant.estimated_price_tier.replace(/_/g, ' ') : ''}
                            </Text>
                            <Text style={[ styles.locationTag, { backgroundColor: 'green', color: 'white', textAlign: 'center' },]}>
                                {restaurant.generic_location ? restaurant.generic_location.replace(/_/g, ' ') : ''}
                            </Text>
                        </View>


                        <View style={styles.carouselContainer}>
                            <Carousel
                                data={imgList}
                                renderItem={renderCarouselItem}
                                sliderWidth={330}
                                itemWidth={330}
                                layout={'default'}
                                onSnapToItem={(index) => setImageActiveSlide(index)}
                            />
                            <Pagination
                                dotsLength={imgList.length} // Total number of items
                                activeDotIndex={imageActiveSlide} // Current active slide index
                                containerStyle={{ paddingVertical: 10, marginTop: 5 }}
                                dotStyle={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: 5,
                                    backgroundColor: 'rgba(0, 0, 0, 0.92)',
                                }}
                                inactiveDotOpacity={0.4}
                                inactiveDotScale={0.6}
                            />
                        </View>
                        
                        <Text style={[styles.subtitle]}>{restaurant.address}</Text>
                        <Text style={styles.description}>{restaurant.description}</Text>

                        <Text style={{ fontSize: 12 }}>
                        <Text style={{ fontWeight: 'bold' }}>Operating Hours:</Text>{' '}
                            {restaurant.opening_hours}
                        </Text>

                        <Text style={{ fontSize: 12 }}>
                        <Text style={{ fontWeight: 'bold' }}>Contact Us @ </Text>
                            {restaurant.contact_num}
                        </Text>

                    </Card>
                    
                    <Card containerStyle={styles.dropBorder}>
                        <Card.Title style={styles.header}>
                            Menu
                        </Card.Title>
                        
                        {/* to display the menu  */}
                        <View style={{ justifyContent: 'center', flex: 1, alignItems: 'left', marginLeft: -15, marginTop: -11}}>
                            { showDishList }
                        </View>

                    </Card>
            
                    <View> 
                        { recommendation.length > 0 && (
                        <Card containerStyle={styles.dropBorder}>
                            <Card.Title style={styles.header}>
                                Nearby Recommendations
                            </Card.Title>

                            <ScrollView horizontal>
                                <View style={{ flexDirection: 'row', height: 350 }}>
                                    {
                                        recommendation.map((item, index) => (
                                            <TouchableOpacity key={index} onPress={() => handleItemClick(item)}>
                                                {item.listing_type === 'ATTRACTION' && (
                                                    <AttractionRecom item={item} />
                                                )}
                                                {item.listing_type === 'RESTAURANT' && (
                                                    <RestaurantRecom item={item} />
                                                )}
                                                {item.listing_type === 'ACCOMMODATION' && (
                                                    <AccommodationRecom item={item} />
                                                )}
                                            </TouchableOpacity>
                                        ))
                                    }
                                </View>
                            </ScrollView>
                        </Card>
                        )}
                    </View>

                    <View style={styles.centeredView}>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={showModal}
                            onRequestClose={() => {
                                setShowModal(false);
                            }}
                        >

                        <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <Text style={styles.modalText}>You have not created an itinerary!</Text>
                                    <Text style={styles.modalText}>Please create one before adding!</Text>

                                    <View style={{flexDirection: 'row'}}>
                                        {/* close modal button */}
                                        <Pressable
                                            style={[styles.modalButton, styles.buttonClose]}
                                            onPress={() => {
                                                setShowModal(false);
                                            }}>
                                            <Text style={styles.textStyle}>Close</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </ScrollView>
            </Background>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1
    },
    rCard:{
        flex:1,
        width: 320,
        height: 100,
        borderRadius: 4,
        margin: 2
    },
    header:{
        textAlign: 'left',
        fontSize: 13,
        color: '#044537',
        flexDirection: 'row',
        fontWeight: 'bold'
    },
    image: {
        width: 30,height: 30,marginRight: 10,
    },
    name: {
        fontSize: 16,marginTop: 5,
    },
    subtitle: {
        marginBottom: 5, fontSize: 12, color: 'grey'
    },
    description: {
        marginBottom: 10, fontSize: 12, marginTop : 10 
    },
    recommendation:{
        marginBottom: 10, textAlign: 'center', marginTop : 10 
    },
    tag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 80,
        fontSize: 11,
        fontWeight: 'bold'
    },
    tagContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 5,
    },
    typeTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 85,
        fontSize: 9,
        fontWeight: 'bold',
    },
    tierTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 50,
        fontSize: 9,
        fontWeight: 'bold',
    },
    locationTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 80,
        fontSize: 8,
        fontWeight: 'bold',
    },
    dropBorder: {
        borderWidth: 0, 
        shadowColor: 'rgba(0,0,0, 0.0)',
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        backgroundColor: theme.colors.surface,
    },
    carouselContainer: {
        flex: 1,
        marginTop: 8,
        marginBottom: 10,
    },
    cardImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 160,
        width: 300,
        marginTop: -100
    },
    modalButton: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#044537',
    },
    buttonOpen: {
        backgroundColor: '#044537',
    },
    buttonClose: {
        backgroundColor: '#044537',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});

export default RestaurantDetailsScreen