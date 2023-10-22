import React, { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import Button from '../../components/Button';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, CheckBox } from '@rneui/themed';
import { getBookingByBookingId, cancelBookingByBookingId } from '../../redux/reduxBooking';
import { useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { theme } from '../../core/theme';
import { RadioButton } from 'react-native-paper';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TourDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const route = useRoute();
    const { item } = route.params;
    const [selectedTour, setSelectedTour] = useState(null);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)

        const usertype = await getUserType()
    }

    useEffect(() => {
        async function onLoad() {
            const selectedTourId = await AsyncStorage.getItem('selectedTourId');
    
            if (selectedTourId) {
                const selectedTourItem = item.tour_list.find(
                    (tourListItem) => tourListItem.tour_id === JSON.parse(selectedTourId)
                );
    
                if (selectedTourItem) {
                    setSelectedTour(selectedTourItem);
                }
            }
        }
    
        onLoad();
    }, []);

    const handleRadioButtonChange = (tourListItem) => {
        if (selectedTour === tourListItem) {
            setSelectedTour(null);

            AsyncStorage.removeItem('selectedTourId')
                .then(() => {
                    console.log(`Cleared AsyncStorage for selectedTourId`);
                })
                .catch((error) => {
                    console.error('Error clearing AsyncStorage: ', error);
                });
            AsyncStorage.removeItem('selectedTourType')
                .then(() => {
                    console.log(`Cleared AsyncStorage for selectedTourType`);
                })
                .catch((error) => {
                    console.error('Error clearing AsyncStorage: ', error);
                });
        } else {
            setSelectedTour(tourListItem);

            AsyncStorage.setItem('selectedTourId', JSON.stringify(tourListItem.tour_id))
                .then(() => {
                    console.log('selectedTourId saved to local storage');
                })
                .catch((error) => {
                    console.error('Error saving selectedTourId to local storage: ', error);
                });
            AsyncStorage.setItem('selectedTourType', JSON.stringify(item))
                .then(() => {
                    console.log('selectedTourType saved to local storage');
                })
                .catch((error) => {
                    console.error('Error saving selectedTourType to local storage: ', error);
                });
        }
    }

    const formatTime = (time) => {
        return moment(time).format('h:mm A');
    }

    return item ? (
        <Background>
            <ScrollView>
                <Card>
                    <Card.Title style={styles.header}>
                        {item.name}
                    </Card.Title>
                    <Card.Image
                        style={{ padding: 0 }}
                        source={{
                            uri: item.tour_image_list[0]
                        }}
                    />
                    <Text style={styles.description}>Price: S${item.price}</Text>
                    <Text style={styles.description}>Estimated Duration: {item.estimated_duration} Hours</Text>
                    <Text style={styles.description}>Recommended Pax: {item.recommended_pax}</Text>
                    <Text style={styles.description}>
                        Special Notes: {item.special_note ? item.special_note : 'N/A'}
                    </Text>
                </Card>
                <Card>
                    <Card.Title style={styles.header}>Available Timings</Card.Title>
                    {item.tour_list.map((tourListItem, index) => (
                        <RadioButton.Item
                            key={index}
                            label={`${formatTime(tourListItem.start_time)} - ${formatTime(tourListItem.end_time)}\nRemaining Slots: ${tourListItem.remaining_slot}`}
                            value={tourListItem.tour_id}
                            status={selectedTour === tourListItem ? 'checked' : 'unchecked'}
                            onPress={() => handleRadioButtonChange(tourListItem)}
                        />
                    ))}
                </Card>
            </ScrollView>
        </Background>
    ) : ''
}

const styles = StyleSheet.create({
    header: {
        textAlign: 'center',
        fontSize: 15,
        color: '#044537'
    },
    image: {
        width: 30, height: 30, marginRight: 10,
    },
    name: {
        fontSize: 16, marginTop: 5,
    },
    description: {
        marginBottom: 10, fontSize: 13, marginTop: 10
    },
    tag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 90,
        fontSize: 10,
        fontWeight: 'bold'
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
});

export default TourDetailsScreen