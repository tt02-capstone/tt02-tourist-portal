import React, { useState, useEffect } from 'react'
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getTelecomRecommendations, getAttractionRecommendationsByDate, getAccommodationRecommendationsForItinerary, getRestaurantRecommendationsForItinerary } from '../../redux/itineraryRedux';
import { useRoute } from '@react-navigation/native';
import AttractionRecom from '../Recommendation/AttractionRecom';
import RestaurantRecom from '../Recommendation/RestaurantRecom';
import AccommodationRecom from '../Recommendation/AccommodationRecom';
import TelecomRecom from '../Recommendation/TelecomRecom';

const ItineraryRecommendationsScreen = ({ navigation }) => {
    const route = useRoute();
    const { date, itineraryId } = route.params;
    const [telecomRecommendations, setTelecomRecommendations] = useState([]);
    const [accommodationRecommendations, setAccommodationRecommendations] = useState([]);
    const [attractionRecommendations, setAttractionRecommendations] = useState([]);
    const [restaurantRecommendations, setRestaurantRecommendations] = useState([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                console.log('itineraryId', itineraryId);
                console.log('date', date);
                const response1 = await getAccommodationRecommendationsForItinerary(itineraryId);
                if (response1.status) {
                    setAccommodationRecommendations(response1.data);
                }

                const response2 = await getTelecomRecommendations(itineraryId);
                if (response2.status) {
                    setTelecomRecommendations(response2.data);
                }

                const response3 = await getAttractionRecommendationsByDate(itineraryId, date);
                if (response3.status) {
                    setAttractionRecommendations(response3.data);
                }

                const response4 = await getRestaurantRecommendationsForItinerary(itineraryId, date);
                if (response4.status) {
                    setRestaurantRecommendations(response4.data);
                }

                console.log('response1', response1.data);
                console.log('response2', response2.data);
                console.log('response3', response3.data);
                console.log('response4', response4.data);
            } catch (error) {
                console.error('Error fetching recommendations: ', error);
            }
        };

        fetchRecommendations();
    }, [date, itineraryId]);

    const viewRecommendedAttraction = (redirect_attraction_id) => {
        navigation.push('AttractionDetailsScreen', { attractionId: redirect_attraction_id });
    }

    const viewRecommendedRest = (redirect_rest_id) => {
        navigation.push('RestaurantDetailsScreen', { restId: redirect_rest_id });
    }

    const viewRecommendedAccom = (redirect_accom_id) => {
        navigation.push('AccommodationDetailsScreen', { accommodationId: redirect_accom_id });
    }

    const viewRecommendedTelecom = (redirect_telecom_id) => {
        navigation.push('TelecomDetailsScreen', { id: redirect_telecom_id });
    }

    const handleItemClick = (item) => {
        if (item.listing_type === "ATTRACTION") {
            viewRecommendedAttraction(item.attraction_id);
        } else if (item.listing_type === "RESTAURANT") {
            viewRecommendedRest(item.restaurant_id);
        } else if (item.listing_type === "ACCOMMODATION") {
            viewRecommendedAccom(item.accommodation_id);
        } else {
            viewRecommendedTelecom(item.telecom_id);
        }
    }

    function formatDate(inputDate) {
        const date = new Date(inputDate);
        const formattedDate = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);

        return formattedDate;
    }

    return (
        <View style={styles.container}>
            <Text>{'\n'}</Text>
            <ScrollView style={styles.scrollContainer}>
                <Text style={styles.title}>Recommendations for your trip</Text>
                {/* Telecom Recommendations */}
                {telecomRecommendations.length > 0 && <Text style={styles.subtitle}>Telecom Packages</Text>}
                {telecomRecommendations.length > 0 && <View style={{ flexDirection: 'row', height: 300 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {
                            telecomRecommendations.map((item, index) => (
                                <TouchableOpacity key={index} onPress={() => handleItemClick(item)}>
                                    <TelecomRecom item={item} />
                                </TouchableOpacity>
                            ))
                        }
                    </ScrollView>
                </View>}

                {/* Accommodation Recommendations */}
                {accommodationRecommendations.length > 0 && <Text style={styles.subtitle}>Accommodations</Text>}
                {accommodationRecommendations.length > 0 && <View style={{ flexDirection: 'row', height: 300 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {
                            accommodationRecommendations.map((item, index) => (
                                <TouchableOpacity key={index} onPress={() => handleItemClick(item)}>
                                    <AccommodationRecom item={item} />
                                </TouchableOpacity>
                            ))
                        }
                    </ScrollView>
                </View>}

                <Text style={styles.title}>Recommendations for {formatDate(date)}</Text>
                {/* Attraction Recommendations */}
                {attractionRecommendations.length > 0 && <Text style={styles.subtitle}>Attractions</Text>}
                {attractionRecommendations.length > 0 && <View style={{ flexDirection: 'row', height: 300 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {
                            attractionRecommendations.map((item, index) => (
                                <TouchableOpacity key={index} onPress={() => handleItemClick(item)}>
                                    <AttractionRecom item={item} />
                                </TouchableOpacity>
                            ))
                        }
                    </ScrollView>
                </View>}

                {/* Restaurant Recommendations */}
                {restaurantRecommendations.length > 0 && <Text style={styles.subtitle}>Restaurants</Text>}
                {restaurantRecommendations.length > 0 && <View style={{ flexDirection: 'row', height: 300 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {
                            restaurantRecommendations.map((item, index) => (
                                <TouchableOpacity key={index} onPress={() => handleItemClick(item)}>
                                    <RestaurantRecom item={item} />
                                </TouchableOpacity>
                            ))
                        }
                    </ScrollView>
                </View>}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
    },
    recommendationContainer: {
        marginBottom: 0,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default ItineraryRecommendationsScreen
