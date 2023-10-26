
import React, { useState, useEffect, useCallback } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import Header from '../../components/Header';
import TextInput from '../../components/TextInput';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, CheckBox, Tab, TabView } from '@rneui/themed';
import InputValidator from '../../helpers/InputValidator';
import { getItineraryByUser, updateItinerary } from '../../redux/itineraryRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'
import { DatePickerModal } from 'react-native-paper-dates';
import { useIsFocused } from "@react-navigation/native";
import { timeZoneOffset } from "../../helpers/DateFormat";

const EditItineraryScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const isFocused = useIsFocused();
    const [itinerary, setItinerary] = useState('');
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        start_date: undefined,
        end_date: undefined,
        number_of_pax: undefined,
        remarks: '',
    });
    const [open, setOpen] = useState(false);

    const route = useRoute();
    const { itineraryId } = route.params;

    useEffect(() => {
        async function onLoad() {
            console.log("editScreen entering onLoad")
            try {
                const userData = await getUser();
                setUser(userData);
                const userId = userData.user_id;
                console.log("editScreen userId", userId);

                let response = await getItineraryByUser(userId);
                console.log("editScreen response.data", response.data)
                setItinerary(response.data);

                setValues({
                    // start_date: response.data.start_date,
                    // end_date: response.data.end_date,
                    number_of_pax: response.data.number_of_pax,
                    remarks: response.data.remarks,
                })

                console.log("editScreen values", values);
                console.log("editScreen itineraryid", itineraryId);

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

    async function handleEdit() {

        const time = '00:01:00';

        const itineraryStartDate = new Date(values.start_date);
        itineraryStartDate.setHours(itineraryStartDate.getHours() + timeZoneOffset);
        const itineraryStartDateInLocalDateTime = `${itineraryStartDate.toISOString().split('T')[0]}T${time}Z`;

        const itineraryEndDate = new Date(values.end_date);
        const itineraryEndDateInLocalDateTime = `${itineraryEndDate.toISOString().split('T')[0]}T${time}Z`;

        let itineraryObj = {
            start_date: itineraryStartDateInLocalDateTime,
            end_date: itineraryEndDateInLocalDateTime,
            number_of_pax: values.number_of_pax,
            remarks: values.remarks,
        }

        console.log("itineraryObj", itineraryObj);
        console.log("itineraryId", itineraryId);

        let response = await updateItinerary(itineraryId, itineraryObj);
        if (response.status) {
            Toast.show({
                type: 'success',
                text1: 'Itinerary edited!'
            })

            navigation.reset({
                index: 3,
                routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'ItineraryScreen' }, { name: 'ItineraryScreen' }],
            });

        } else {
            console.log("Itinerary edit failed!");
            console.log(response.data);
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
            const currentDate = new Date();

            console.log("startDate", startDate);
            console.log("endDate", endDate);

            if (startDate && endDate) {
                if (startDate < currentDate) {
                    setValues({ start_date: null, end_date: null });
                    onDismiss();
                    Toast.show({
                        type: 'error',
                        text1: 'Cannot select past dates.'
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

    return (
        <Background style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.header}>
                Edit Support Ticket
            </Text>

            <ScrollView automaticallyAdjustKeyboardInsets={true}>
                <View style={{ alignItems: 'center', minHeight: '100%' }}>
                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 340, height: 100, marginTop: -15 }}>

                        <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
                            {values.start_date && values.end_date ? `${formatDatePicker(values.start_date)} - ${formatDatePicker(values.end_date)}` : 'Pick range'}
                        </Button>
                        <DatePickerModal
                            locale='en-GB'
                            mode="range"
                            format
                            label="Itinerary Date Range"
                            visible={open}
                            startDate={values.start_date}
                            endDate={values.end_date}
                            onConfirm={onConfirm}
                            onDismiss={onDismiss}
                            inputMode="start"
                        />

                        <TextInput
                            style={styles.input}
                            value={values.number_of_pax}
                            onChangeText={(value) => setValues({ ...values, number_of_pax: value })}
                            errorText={values.number_of_pax ? InputValidator.text(values.number_of_pax) : ''}
                            keyboardType="numeric"
                        />

                        <TextInput
                            style={styles.description}
                            label="Write your message here"
                            multiline={true}
                            value={values.remarks}
                            onChangeText={(value) => setValues({ ...values, remarks: value })}
                            errorText={values.remarks ? InputValidator.text(values.remarks) : ''}
                        />
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Button
                                mode="contained"
                                text={"Submit"}
                                onPress={handleEdit}
                            />
                        </View>
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
        textAlignVertical: 'top'
    },
});

export default EditItineraryScreen
