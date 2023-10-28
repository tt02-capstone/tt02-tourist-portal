
import React, { useState, useEffect, useCallback } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import Header from '../../components/Header';
import TextInput from '../../components/TextInput';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Text, Card, CheckBox, Tab, TabView } from '@rneui/themed';
import InputValidator from '../../helpers/InputValidator';
import { createDiyEvent } from '../../redux/diyEventRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'
import DateTimePicker from '@react-native-community/datetimepicker';
import { timeZoneOffset } from "../../helpers/DateFormat";
import { getItineraryByUser } from '../../redux/itineraryRedux';
import { useIsFocused } from "@react-navigation/native";

const CreateTelecomDIYEventScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        name: '',
        startDate: new Date(), // picker value
        startTime: new Date(), // picker value
        endTime: new Date(), // picker value
        start_datetime: new Date(), // to send to backend
        end_datetime: new Date(), // to send to backend
        location: '',
        remarks: '',
    });
    const [isSubmit, setIsSubmit] = useState(false);
    const [open, setOpen] = useState(false);
    const isFocused = useIsFocused();
    const [itinerary, setItinerary] = useState(null);

    const route = useRoute();
    const { typeId, selectedTelecom } = route.params;

    useEffect(() => {
        async function onLoad() {
            console.log("createTelecomDIYEventScreen entering onLoad")
            try {
                const userData = await getUser();
                setUser(userData);
                const userId = userData.user_id;
                console.log("Telecom userId", userId);

                let response = await getItineraryByUser(userId);
                console.log("Telecom itinerary", response.data)
                setItinerary(response.data);

                console.log("itineraryid", response.data.itinerary_id);

                setLoading(false);
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

    useEffect(() => {
    }, [values]);

    function createDateTimeObjects(adjustedStartDate, adjustedStartTime) {
        // Extract date parts from adjustedStartDate
        const startDateYear = adjustedStartDate.getFullYear();
        const startDateMonth = adjustedStartDate.getMonth() + 1; // Month is zero-indexed, so add 1
        const startDateDay = adjustedStartDate.getDate();

        // Extract time parts from adjustedStartTime
        const startTimeHours = adjustedStartTime.getHours();
        const startTimeMinutes = adjustedStartTime.getMinutes();
        const startTimeSeconds = adjustedStartTime.getSeconds();

        // Create startDateTime and endDateTime
        const startDateTime = new Date(
            startDateYear,
            startDateMonth - 1, // Subtract 1 to get the zero-indexed month
            startDateDay,
            startTimeHours,
            startTimeMinutes,
            startTimeSeconds
        );

        return startDateTime;
    }

    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    async function onSubmit() {

        setLoading(true);
        setIsSubmit(true);

        let diyEventObj;

        // console.log("values", values);

        const adjustedStartDate = new Date(values.startDate);
        adjustedStartDate.setHours(values.startDate.getHours() + timeZoneOffset);
        // console.log("adjustedStartDate", adjustedStartDate);

        const adjustedStartTime = new Date(values.startTime);
        adjustedStartTime.setHours(values.startTime.getHours() + timeZoneOffset);
        // console.log("adjustedStartTime", adjustedStartTime);

        // Set endDateTime based on number of days SIM card is valid for
        const startDateTime = createDateTimeObjects(adjustedStartDate, adjustedStartTime);
        const endDateTime = addDays(startDateTime, selectedTelecom.num_of_days_valid);

        console.log("startDateTime", startDateTime);
        console.log("endDateTime", endDateTime);

        // start_datetime and end_datetime can be configured as some users might book multiple different hotels during a trip
        diyEventObj = {
            name: selectedTelecom ? selectedTelecom.name : '',
            start_datetime: startDateTime.toISOString(),
            end_datetime: endDateTime.toISOString(),
            location: 'N/A',
            remarks: values.remarks,
        }

        const type = "telecom";

        console.log("itinerary.itinerary_id", itinerary.itinerary_id);
        console.log("typeId", typeId);
        console.log("diyEventObj", diyEventObj);
        console.log("type", type);

        let response = await createDiyEvent(itinerary.itinerary_id, typeId, type, diyEventObj);
        if (response.status) {
            setIsSubmit(false);
            Toast.show({
                type: 'success',
                text1: 'Telecom added to itinerary!'
            })

            navigation.reset({
                index: 2,
                routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'ItineraryScreen' }],
            });

        } else {
            console.log('error')
            setIsSubmit(false);
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }

    const onDismiss = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const onConfirm = useCallback(
        ({ startDate, endDate }) => {
            const itineraryStartDate = new Date(itinerary.start_date);
            const itineraryEndDate = new Date(itinerary.end_date);

            if (startDate && endDate) {
                if (startDate < currentDate) {
                    setValues({ start_date: null, end_date: null });
                    onDismiss();
                    Toast.show({
                        type: 'error',
                        text1: 'Telecom cannot be added to Itinerary for past dates.'
                    });
                } else {
                    setOpen(false);
                    // might cause issues
                    setValues({ start_date: startDate, end_date: endDate });
                }
            } else {
                setOpen(false);
                setValues({ start_date: startDate, end_date: endDate });
                onDismiss();
                Toast.show({
                    type: 'error',
                    text1: 'Both start and end dates must be selected.'
                });
            }
        },
        [setOpen, setValues, onDismiss]
    );

    function formatDatePicker(string) {
        const date = new Date(string);
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString([], dateOptions);
    }

    const onDateChange = (event, selectedDate) => {
        console.log("startDate", selectedDate);
        setValues({ ...values, startDate: selectedDate })
    };

    const onStartTimeChange = (event, selectedTime) => {
        console.log("startTime", selectedTime);
        setValues({ ...values, startTime: selectedTime })
    };

    const onEndTimeChange = (event, selectedTime) => {
        console.log("endTime", selectedTime);
        setValues({ ...values, endTime: selectedTime })
    };

    return (
        <Background style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.header}>
                Add Telecom to Itinerary
            </Text>

            <ScrollView automaticallyAdjustKeyboardInsets={true}>
                <View style={{ alignItems: 'center', minHeight: '100%' }}>
                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 340, height: 100, marginTop: -15 }}>

                        {/* add suggested duration somewhere */}

                        <DateTimePicker
                            testID="startDatePicker"
                            value={values.startDate}
                            mode={"date"}
                            is24Hour={true}
                            onChange={onDateChange}
                        />

                        <DateTimePicker
                            testID="startTimePicker"
                            value={values.startTime}
                            mode={"time"}
                            is24Hour={true}
                            onChange={onStartTimeChange}
                        />

                        <Text>Event Name: {selectedTelecom ? selectedTelecom.name + ' Telecom Package' : 'no telecom'}</Text>

                        <TextInput
                            style={styles.description}
                            label="Write your remarks here"
                            multiline={true}
                            value={values.remarks}
                            onChangeText={(value) => setValues({ ...values, remarks: value })}
                            errorText={values.remarks ? InputValidator.text(values.remarks) : ''}
                        />
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                        <Button
                            style={{ width: 150, marginLeft: 60 }}
                            mode="contained"
                            text={"Submit"}
                            onPress={onSubmit}
                        />
                        {/* <View style={{ marginLeft: 30 }}><ActivityIndicator size='large' animating={isSubmit} color='green' /></View> */}
                    </View>
                </View>
            </ScrollView>
        </Background>
    )
}

const styles = StyleSheet.create({
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
    boldText: {
        fontWeight: 'bold',
    },
    header: {
        fontSize: 21,
        color: theme.colors.primary,
        fontWeight: 'bold',
        paddingVertical: 12,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10
    },
    description: {
        width: 320,
        height: 200,
        marginTop: -15,
        textAlignVertical: 'top',
    },
    input: {
        width: 320,
        height: 50,
        marginTop: 10,
    },
});

export default CreateTelecomDIYEventScreen
