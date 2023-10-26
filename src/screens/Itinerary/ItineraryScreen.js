import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { getItineraryByUser, createItinerary, updateItinerary, deleteItinerary } from '../../redux/itineraryRedux';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from "@react-navigation/native";
import { DatePickerModal } from 'react-native-paper-dates';
import CreateItineraryScreen from './CreateItineraryScreen';
import { IconButton } from 'react-native-paper';

const ItineraryScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const isFocused = useIsFocused();
    const [range, setRange] = useState({ startDate: undefined, endDate: undefined });
    const [open, setOpen] = useState(false);
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function onLoad() {
            const user = await getUser();
            setUser(user);
        }
        onLoad();
        fetchItinerary();

        if (isFocused) {
            onLoad();
            fetchItinerary();
        }

    }, [isFocused]);

    const fetchItinerary = async () => {
        console.log("user.user_id", user.user_id);
        try {
            let response = await getItineraryByUser(user.user_id);
            console.log("response");
            if (response.status) {
                console.log("response", response.data);
                setItinerary(response.data);
                setLoading(false);
    
            } else {
                console.log("Itinerary not fetched!");
            }
        } catch (error) {
            alert('An error occur! Failed to retrieve itinerary details!');
            setLoading(false);
        }
    }

    const handleDeleteItineraryPress = (itineraryId) => {

        Alert.alert(
            "Delete Confirmation",
            "Are you sure you want to delete this itinerary?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Delete Cancelled"),
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: () => handleDeleteItinerary(user.user_id, itineraryId)
                }
            ],
            { cancelable: false }
        );
    };

    async function handleDeleteItinerary(userId, itineraryId) {

        let response = await deleteItinerary(userId, itineraryId);

        if (response.status) {

            Toast.show({
                type: 'success',
                text1: 'Itinerary deleted!'
            })

        } else {
            console.log("Itinerary deletion failed!");
            console.log(response.data);
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }

    return (
        <View>
            <Button text="+ Create Itinerary" style={styles.button} onPress={() => navigation.navigate('CreateItineraryScreen')} />
            <View style={styles.iconContainer}>
                {/* <IconButton
                    icon="pencil"
                    size={20}
                    style={styles.icon}
                    onPress={() => navigation.navigate('EditItineraryScreen', { itineraryId: item.itinerary_id, itineraryItineraryId: ItineraryId })}
                /> */}
                <IconButton
                    icon="delete"
                    size={20}
                    style={styles.icon}
                    onPress={() => handleDeleteItineraryPress(itinerary.itinerary_id)}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        width: '40%',
        marginLeft: '30%',
        marginRight: '30%',
        backgroundColor: '#5f80e3'
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginLeft: -5,
        marginTop: -5,
        marginRight: 3,
    },
});

export default ItineraryScreen
