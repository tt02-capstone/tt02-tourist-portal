import React, { useState, useCallback } from 'react'
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@rneui/themed';
import { getSuggestedEventsBasedOnTimeslot } from '../../redux/itineraryRedux';
import { useRoute } from '@react-navigation/native';
import AttractionRecom from '../Recommendation/AttractionRecom';
import RestaurantRecom from '../Recommendation/RestaurantRecom';
import Button from '../../components/Button'
import { Button as DateButton } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import moment from 'moment';
import Toast from "react-native-toast-message";

const EventSuggestionsScreen = ({ navigation }) => {
    const [attractionRecommendations, setAttractionRecommendations] = useState([]);
    const [restaurantRecommendations, setRestaurantRecommendations] = useState([]);

    const [startTime, setStartTime] = useState(null);
    const [openStartTime, setOpenStartTime] = useState(false);

    const [endTime, setEndTime] = useState(null);
    const [openEndTime, setOpenEndTime] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit = async () => {
        try {
            if (!startTime || !endTime) {
                Toast.show({
                    type: 'error',
                    text1: 'Please select both start and end time!'
                })
                return;
            }

            if (endTime.hours < startTime.hours || (endTime.hours === startTime.hours && endTime.minutes <= startTime.minutes)) {
                Toast.show({
                    type: 'error',
                    text1: 'End time should be later than start time!'
                });
                return;
            }

            let formattedStartTime = `${startTime.hours.toString().padStart(2, '0')}:${startTime.minutes.toString().padStart(2, '0')}:00`;;
            let formattedEndTime = `${endTime.hours.toString().padStart(2, '0')}:${endTime.minutes.toString().padStart(2, '0')}:00`;;
            console.log('startTime', formattedStartTime);
            console.log('endTime', formattedEndTime);
            let response = await getSuggestedEventsBasedOnTimeslot(formattedStartTime, formattedEndTime);
            if (response.status) {
                console.log(response);
                setAttractionRecommendations(response.data.attractions);
                setRestaurantRecommendations(response.data.restaurants);
            } else {
                console.log("No event suggestions!");
                setErrorMessage(response.data.errorMessage);
                setAttractionRecommendations([]);
                setRestaurantRecommendations([]);
            }

        } catch (error) {
            console.error('Error during API call: ', error);
        }
    };

    const viewRecommendedAttraction = (redirect_attraction_id) => {
        navigation.push('AttractionDetailsScreen', { attractionId: redirect_attraction_id });
    }

    const viewRecommendedRest = (redirect_rest_id) => {
        navigation.push('RestaurantDetailsScreen', { restId: redirect_rest_id });
    }

    const handleItemClick = (item) => {
        if (item.listing_type === "ATTRACTION") {
            viewRecommendedAttraction(item.attraction_id);
        } else if (item.listing_type === "RESTAURANT") {
            viewRecommendedRest(item.restaurant_id);
        }
    }

    // start time form
    const onStartTimeDismiss = useCallback(() => {
        setOpenStartTime(false);
    }, [setOpenStartTime]);

    const onStartTimeConfirm = useCallback(
        (formStartTime) => {
            setStartTime(formStartTime);
            setOpenStartTime(false);
        },
        [setOpenStartTime, setStartTime]
    );

    // end time form
    const onEndTimeDismiss = useCallback(() => {
        setOpenEndTime(false);
    }, [setOpenEndTime]);

    const onEndTimeConfirm = useCallback(
        (formEndTime) => {
            setEndTime(formEndTime);
            setOpenEndTime(false);
        },
        [setOpenEndTime, setEndTime]
    );

    function formatTimePicker(obj) {
        let date = new Date();
        date.setHours(obj.hours);
        date.setMinutes(obj.minutes);
        return moment(date).format('LT');
    }

    return (
        <View style={styles.container}>
            <Text>{'\n'}</Text>
            <ScrollView style={styles.scrollContainer}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{marginTop: 15}}>From </Text>
                        <DateButton onPress={() => setOpenStartTime(true)} uppercase={false} mode="outlined" style={{ marginTop: 10, marginBottom: -5, marginLeft: 5, width: 115 }}>
                            {startTime ? `${formatTimePicker(startTime)}` : 'Start'}
                        </DateButton>
                        <TimePickerModal
                            visible={openStartTime}
                            onDismiss={onStartTimeDismiss}
                            onConfirm={onStartTimeConfirm}
                            hours={8}
                            minutes={0}
                        />

                        <Text style={{marginTop: 15}}>  To </Text>
                        <DateButton onPress={() => setOpenEndTime(true)} uppercase={false} mode="outlined" style={{ marginTop: 10, marginBottom: -5, marginLeft: 5, width: 115 }}>
                            {endTime ? `${formatTimePicker(endTime)}` : 'End'}
                        </DateButton>
                        <TimePickerModal
                            visible={openEndTime}
                            onDismiss={onEndTimeDismiss}
                            onConfirm={onEndTimeConfirm}
                            hours={22}
                            minutes={59}
                        />
                    </View>
                </View>

                <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 20, marginBottom: 30 }}>
                    <Button
                        mode="contained"
                        text={"Get Recommendations"}
                        onPress={onSubmit}
                    />
                </View>

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

                {attractionRecommendations.length == 0 && restaurantRecommendations.length == 0 && <Text style={styles.emptyMessage}>{errorMessage}</Text>}
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
    emptyMessage: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'gray',
        textAlign: 'center'
    },
});

export default EventSuggestionsScreen