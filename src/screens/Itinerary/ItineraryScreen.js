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

const ItineraryScreen = ({ navigation }) => {

    const isFocused = useIsFocused();
    const [range, setRange] = useState({ startDate: undefined, endDate: undefined });
    const [open, setOpen] = useState(false);

    useEffect(() => {
        async function onLoad() {
            const user = await getUser();
        }
        onLoad();

        if (isFocused) {
            onLoad();
        }

    }, [isFocused]);

    return (
        <Button text="+ Create Itinerary" style={styles.button} onPress={() => navigation.navigate('CreateItineraryScreen')} />
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    button: {
        width: '40%',
        marginLeft: '30%',
        marginRight: '30%',
        backgroundColor: '#5f80e3'
    },
});

export default ItineraryScreen
