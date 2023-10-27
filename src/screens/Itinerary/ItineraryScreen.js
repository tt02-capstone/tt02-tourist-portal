import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal, Alert, Text } from 'react-native';
import { getItineraryByUser, createItinerary, updateItinerary, deleteItinerary } from '../../redux/itineraryRedux';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from "@react-navigation/native";
import { DatePickerModal } from 'react-native-paper-dates';
import CreateItineraryScreen from './CreateItineraryScreen';
import { IconButton } from 'react-native-paper';
import Toast from "react-native-toast-message";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

const ItineraryScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const isFocused = useIsFocused();
    const [range, setRange] = useState({ startDate: undefined, endDate: undefined });
    const [open, setOpen] = useState(false);
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [index, setIndex] = useState(0);
    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        async function onLoad() {
            console.log("entering onLoad")
            try {
                const userData = await getUser();
                setUser(userData);
                const userId = userData.user_id;
                console.log("userId", userId);

                let response = await getItineraryByUser(userId);
                console.log("response.data", response.data)
                setItinerary(response.data);
                setLoading(false);

                const numberOfDays = calculateNumberOfDays(response.data.start_date, response.data.end_date);
                const generatedRoutes = [];
                for (let i = 0; i < numberOfDays; i++) {
                    generatedRoutes.push({ key: `day${i + 1}`, title: `Day ${i + 1}` });
                }
                setRoutes(generatedRoutes);
                console.log("routes", routes);
            } catch (error) {
                alert('An error occurred! Failed to retrieve itinerary!');
                setLoading(false);
            }
        }
        onLoad();

        if (isFocused) {
            onLoad();
        }

    }, [isFocused]);

    // Function to calculate the number of days between two dates
    const calculateNumberOfDays = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDifference = end - start;
        const daysDifference = timeDifference / (1000 * 3600 * 24);
        return Math.floor(daysDifference) + 1;
    };

    const handleDeleteItineraryPress = (itineraryId) => {

        console.log("itineraryId", itineraryId);

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

        console.log("userId", userId);
        console.log("ItineraryId", itineraryId);

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

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'day1':
                return <View><Text>Day 1 Itinerary</Text></View>; // Replace with your content
            default:
                const dayNum = parseInt(route.key.replace('day', ''));
                return <View><Text>Day {dayNum} Itinerary</Text></View>;
        }
    }

    const calculateTabWidth = () => {
        return routes.length <= 4 ? 390 / routes.length : 87;
    };

    return (
        <ScrollView>
            <Button text="+ Create Itinerary" style={styles.button} onPress={() => navigation.navigate('CreateItineraryScreen')} />
            <View style={styles.iconContainer}>
                <IconButton
                    icon="pencil"
                    size={20}
                    style={styles.icon}
                    onPress={() => navigation.navigate('EditItineraryScreen', { itineraryId: itinerary.itinerary_id })}
                />
                <IconButton
                    icon="delete"
                    size={20}
                    style={styles.icon}
                    onPress={() => handleDeleteItineraryPress(itinerary.itinerary_id)}
                />
            </View>

            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: '100%' }}
                scrollEnabled={true}
                renderTabBar={props => (
                    <TabBar 
                        {...props} 
                        scrollEnabled={true} 
                        tabStyle={{ width: calculateTabWidth() }} 
                    />
                )}
            />
        </ScrollView>
    );
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
