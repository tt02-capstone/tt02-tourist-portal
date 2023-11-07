import React, { useState, useEffect, useCallback } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import { Button as DateButton } from 'react-native-paper';
import TextInput from '../../components/TextInput';
import { getUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet } from 'react-native';
import InputValidator from '../../helpers/InputValidator';
import moment from 'moment';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { timeZoneOffset } from "../../helpers/DateFormat";
import { createDiyEvent } from '../../redux/diyEventRedux';

const CreateDIYEventScreen = ({ navigation }) => {

    const route = useRoute();
    const { itinerary } = route.params;
    const [user, setUser] = useState('');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: undefined,
        location: undefined,
        remarks: '',
    });

    const [open, setOpen] = useState(false); // form date range
    const [formStartDate, setFormStartDate] = useState(undefined);
    const [formEndDate, setFormEndDate] = useState(undefined);

    const [openStartTime, setOpenStartTime] = useState(false); // form start time
    const [formStartTime, setFormStartTime] = useState(undefined);

    const [openEndTime, setOpenEndTime] = useState(false); // form end time
    const [formEndTime, setFormEndTime] = useState(undefined);

    async function fetchUser() {
        const userData = await getUser();
        setUser(userData);
    }

    useEffect(() => {
        fetchUser();
        console.log("iti: ", itinerary);
    }, []);

    async function onSubmit() {

        if (formData.name === undefined || formData.name.length === 0) {
            Toast.show({
                type: 'error',
                text1: "Please enter an event name!"
            })
        } else if (formStartDate === undefined || formStartTime === undefined) {
            Toast.show({
                type: 'error',
                text1: "Please enter a valid start date and time!"
            })
        } else if (formEndDate === undefined || formEndTime === undefined) {
            Toast.show({
                type: 'error',
                text1: "Please enter a valid end date and time!"
            })
        } else if (formData.location === undefined || formData.location.length === 0) {
            Toast.show({
                type: 'error',
                text1: "Please enter a location!"
            })
        } else {
            setLoading(true);

            let tempStartDate = timezoneConvert(formStartDate, formStartTime.hours, formStartTime.minutes, 0);
            // console.log("start: ", tempStartDate);

            let tempEndDate = timezoneConvert(formEndDate, formEndTime.hours, formEndTime.minutes, 0);
            // console.log("end: ", tempEndDate);

            if (tempStartDate > tempEndDate) {
                Toast.show({
                    type: 'error',
                    text1: "Ensure that start time is before end time!"
                })
            } else {
                let obj = {
                    name: formData.name,
                    start_datetime: tempStartDate,
                    end_datetime: tempEndDate,
                    location: formData.location,
                    remarks: formData.remarks ? formData.remarks : '',
                }

                // console.log(obj.start_datetime, obj.end_datetime);
    
                let response = await createDiyEvent(itinerary.itinerary_id, 0, "none", obj);
                if (response.status) {
                    Toast.show({
                        type: 'success',
                        text1: 'Event created!'
                    })
    
                    setFormData({
                        name: undefined,
                        location: undefined,
                        remarks: '',
                    });
                
                    setFormStartDate(undefined);
                    setFormEndDate(undefined);
                    setFormStartTime(undefined);
                    setFormEndTime(undefined);
    
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
        }
    }

    // date range form
    const onDismiss = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const timezoneConvert = (time, hour, min, sec) => {
        let temp = new Date(time);
        temp.setHours(hour);
        temp.setMinutes(min);
        temp.setSeconds(sec);
        temp.setHours(temp.getHours() + timeZoneOffset);
        return temp;
    }

    const onConfirm = useCallback(
        ({ startDate, endDate }) => {
            if (startDate && endDate) {
                let currentDate = timezoneConvert(new Date(), 0, 0, 0);
                // console.log("current: ", currentDate);
                let tempStartDate = timezoneConvert(startDate, 0, 5, 0);
                // console.log("startTempDate: ", tempStartDate);
                let tempEndDate = timezoneConvert(endDate, 0, 5, 0);
                // console.log("startEndDate: ", tempEndDate);
                let tempItineraryStartDate = timezoneConvert(itinerary.start_date, 0, 0, 0);
                // console.log("iti start: ", tempItineraryStartDate);
                let tempItineraryEndDate = timezoneConvert(itinerary.end_date, 23, 59, 0);
                // console.log("iti end: ", tempItineraryEndDate);

                if (tempStartDate <= currentDate) {
                    setFormStartDate(null);
                    setFormEndDate(null);
                    onDismiss();
                    Toast.show({
                        type: 'error',
                        text1: 'Event cannot be created for past dates.'
                    });

                } else if (tempStartDate < tempItineraryStartDate || tempEndDate < tempItineraryStartDate || tempStartDate > tempItineraryEndDate || tempEndDate > tempItineraryEndDate) {
                    setFormStartDate(null);
                    setFormEndDate(null);
                    onDismiss();
                    Toast.show({
                        type: 'error',
                        text1: 'Please select within your itinerary date range.'
                    });

                } else { // ok
                    setOpen(false);
                    setFormStartDate(startDate);
                    setFormEndDate(endDate);
                }
            } else {
                setOpen(false);
                setFormStartDate(null);
                setFormEndDate(null);
                onDismiss();
                Toast.show({
                    type: 'error',
                    text1: 'Both start and end dates must be selected.'
                });
            }
        },
        [setOpen, setFormData, onDismiss]
    );

    function formatDatePicker(string) {
        const date = new Date(string);
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString([], dateOptions);
    }

    // start time form
    const onStartTimeDismiss = useCallback(() => {
        setOpenStartTime(false);
    }, [setOpenStartTime]);

    const onStartTimeConfirm = useCallback(
        (formStartTime) => {
            setFormStartTime(formStartTime);
            setOpenStartTime(false);
        },
        [setOpenStartTime, setFormStartTime, onStartTimeDismiss]
    );

    // end time form
    const onEndTimeDismiss = useCallback(() => {
        setOpenEndTime(false);
    }, [setOpenEndTime]);

    const onEndTimeConfirm = useCallback(
        (formEndTime) => {
            setFormEndTime(formEndTime);
            setOpenEndTime(false);
        },
        [setOpenEndTime, setFormEndTime, onEndTimeDismiss]
    );

    function formatTimePicker(obj) {
        let date = new Date();
        date.setHours(obj.hours);
        date.setMinutes(obj.minutes);
        return moment(date).format('LT');
    }

    return (
        <Background style={{ alignItems: 'center', justifyContent: 'center' }}>
            <ScrollView automaticallyAdjustKeyboardInsets={true}>
                <View style={{ alignItems: 'center', minHeight: '100%', marginLeft: 20, marginTop: -180 }}>
                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 340, height: 100 }}>

                        <TextInput
                            style={styles.input}
                            onChangeText={(value) => setFormData({ ...formData, name: value })}
                            value={formData.name}
                            placeholder="Event Name"
                            errorText={formData.name ? InputValidator.text(formData.name) : ''}
                        />

                        <DateButton onPress={() => setOpen(true)} uppercase={false} mode="outlined" style={{marginTop: 10, marginBottom: -5, marginLeft: -5}}>
                            {formStartDate && formEndDate ? `${formatDatePicker(formStartDate)} - ${formatDatePicker(formEndDate)}` : '   Pick Date Range        '}
                        </DateButton>
                        <DatePickerModal
                            locale='en-GB'
                            mode="range"
                            format
                            label="Itinerary Date Range"
                            visible={open}
                            startDate={formStartDate}
                            endDate={formEndDate}
                            onConfirm={onConfirm}
                            onDismiss={onDismiss}
                            inputMode="start"
                        />

                        <DateButton onPress={() => setOpenStartTime(true)} uppercase={false} mode="outlined" style={{marginTop: 10, marginBottom: -5, marginLeft: -5, width: 200}}>
                            {formStartTime ? `${formatTimePicker(formStartTime)}` : 'Pick Start Time'}
                        </DateButton>
                        <TimePickerModal
                            visible={openStartTime}
                            onDismiss={onStartTimeDismiss}
                            onConfirm={onStartTimeConfirm}
                            hours={8}
                            minutes={0}
                        />

                        <DateButton onPress={() => setOpenEndTime(true)} uppercase={false} mode="outlined" style={{marginTop: 10, marginBottom: -5, marginLeft: -5, width: 200}}>
                            {formEndTime ? `${formatTimePicker(formEndTime)}` : 'Pick End Time'}
                        </DateButton>
                        <TimePickerModal
                            visible={openEndTime}
                            onDismiss={onEndTimeDismiss}
                            onConfirm={onEndTimeConfirm}
                            hours={22}
                            minutes={59}
                        />

                        <TextInput
                            style={styles.input}
                            label="Location"
                            value={formData.location}
                            onChangeText={(value) => setFormData({ ...formData, location: value })}
                            errorText={formData.location ? InputValidator.text(formData.location) : ''}
                        />

                        <TextInput
                            style={styles.description}
                            label="Remarks (Optional)"
                            multiline={true}
                            value={formData.remarks}
                            onChangeText={(value) => setFormData({ ...formData, remarks: value })}
                            errorText={formData.remarks ? InputValidator.text(formData.remarks) : ''}
                        />
                    </View>

                    <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                        <Button
                            style={{ width: 150, paddingTop: -100, marginTop: -290, marginLeft: -20 }}
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
        marginTop: -15,
        textAlignVertical: 'top'
    },
    input: {
        width: 320,
        height: 50,
        marginTop: 10,
    },
});

export default CreateDIYEventScreen