
import React, { useState, useEffect, useCallback } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import { Button as DateButton } from 'react-native-paper';
import TextInput from '../../components/TextInput';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';
import InputValidator from '../../helpers/InputValidator';
import { createItinerary } from '../../redux/itineraryRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'
import { DatePickerModal } from 'react-native-paper-dates';
import { timeZoneOffset } from "../../helpers/DateFormat";

const CreateItineraryScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [values, setValues] = useState({
        start_date: undefined,
        end_date: undefined,
        number_of_pax: undefined,
        remarks: '',
    });
    const [open, setOpen] = useState(false);

    const route = useRoute();

    async function fetchUser() {
        const userData = await getUser();
        setUser(userData);
    }

    useEffect(() => {
        fetchUser();
    }, []);

    async function onSubmit() {

        if (values.start_date == undefined) {
            Toast.show({
                type: 'error',
                text1: 'Please select a start date!'
            })
            return;
        } else  if (values.end_date == undefined) {
            Toast.show({
                type: 'error',
                text1: 'Please select an end date!'
            })
            return;
        } else if (values.number_of_pax == undefined) {
            Toast.show({
                type: 'error',
                text1: 'Please enter the number of people!'
            })
            return;
        }

        let itineraryObj;

        // console.log("values", values);

        const startTime = '00:00:00';
        const endTime = '23:59:59';

        const itineraryStartDate = new Date(values.start_date);
        itineraryStartDate.setHours(itineraryStartDate.getHours() + timeZoneOffset);
        const itineraryStartDateInLocalDateTime = `${itineraryStartDate.toISOString().split('T')[0]}T${startTime}Z`;

        const itineraryEndDate = new Date(values.end_date);
        const itineraryEndDateInLocalDateTime = `${itineraryEndDate.toISOString().split('T')[0]}T${endTime}Z`;

        itineraryObj = {
            start_date: itineraryStartDateInLocalDateTime,
            end_date: itineraryEndDateInLocalDateTime,
            number_of_pax: values.number_of_pax,
            remarks: values.remarks ? values.remarks : '',
        }

        console.log("user.user_id", user.user_id);
        console.log("itineraryObj", itineraryObj);

        let response = await createItinerary(user.user_id, itineraryObj);
        if (response.status) {
            Toast.show({
                type: 'success',
                text1: 'Itinerary created!'
            })

            navigation.reset({
                index: 2,
                routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'ItineraryScreen' }],
            });

        } else {
            console.log('error')
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

            if (startDate && endDate) {
                if (startDate < currentDate) {
                    setValues({ start_date: null, end_date: null });
                    onDismiss();
                    Toast.show({
                        type: 'error',
                        text1: 'Itinerary cannot be created for past dates.'
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
                Create Itinerary
            </Text>

            <ScrollView automaticallyAdjustKeyboardInsets={true}>
                <View style={{ alignItems: 'center', minHeight: '100%', marginLeft: 20, marginTop: -160 }}>
                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 340, height: 100 }}>
                        <DateButton onPress={() => setOpen(true)} uppercase={false} mode="outlined" style={{ marginBottom: -5, marginLeft: -15}}>
                            {values.start_date && values.end_date ? `${formatDatePicker(values.start_date)} - ${formatDatePicker(values.end_date)}` : 'Pick range'}
                        </DateButton>
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
                            onChangeText={(value) => setValues({ ...values, number_of_pax: value })}
                            value={values.number_of_pax}
                            placeholder="Number of Pax"
                            keyboardType="numeric"
                        />

                        <TextInput
                            style={styles.description}
                            label="Remarks (Optional)"
                            multiline={true}
                            value={values.remarks}
                            onChangeText={(value) => setValues({ ...values, remarks: value })}
                            errorText={values.remarks ? InputValidator.text(values.remarks) : ''}
                        />
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                        <Button
                            style={{ width: 150, paddingTop: -100, marginTop: -310, marginLeft: -20 }}
                            mode="contained"
                            text={"Submit"}
                            onPress={onSubmit}
                        />
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
        height: 170,
        marginTop: -15,
        textAlignVertical: 'top'
    },
    input: {
        width: 320,
        height: 50,
        marginTop: 10,
    },
});

export default CreateItineraryScreen
