
import React, { useState, useEffect, useCallback } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput';
import { getUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button as DateButton } from 'react-native-paper';
import { Text, Card } from '@rneui/themed';
import InputValidator from '../../helpers/InputValidator';
import { createDiyEvent } from '../../redux/diyEventRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { timeZoneOffset } from "../../helpers/DateFormat";
import { getItineraryByUser } from '../../redux/itineraryRedux';
import { useIsFocused } from "@react-navigation/native";
import moment from 'moment';

const CreateTelecomDIYEventScreen = ({ navigation }) => {

    const isFocused = useIsFocused();
    const route = useRoute();
    const { typeId, selectedTelecom } = route.params;

    const [user, setUser] = useState(null);
    const [itinerary, setItinerary] = useState(null);

    const [startTime, setStartTime] = useState(null);
    const [openStartTime, setOpenStartTime] = useState(false);

    const [values, setValues] = useState({
        remarks: '',
        // name and location given by restaurant by default
    });

    const [date, setDate] = useState(null);
    const [openDate, setOpenDate] = useState(false);

    useEffect(() => {
        async function onLoad() {
            // get user
            const userData = await getUser();
            setUser(userData);
            // console.log(userData);

            // get itinerary
            let response = await getItineraryByUser(userData.user_id);
            if (response.status) {
                setItinerary(response.data);
            } else {
                console.log("itinerary not fetched!");
            }
        }

        if (isFocused) {
            onLoad();
        }

    }, [isFocused]);

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

    function formatTimePicker(obj) {
        let date = new Date();
        date.setHours(obj.hours);
        date.setMinutes(obj.minutes);
        return moment(date).format('LT');
    }

    async function onSubmit() {

        if (date == null) {
            Toast.show({
                type: 'error',
                text1: 'Please select a date!'
            })
            return;
        }

        let tempStartDate = new Date(date);
        tempStartDate.setHours(startTime.hours);
        tempStartDate.setMinutes(startTime.minutes);
        tempStartDate.setSeconds(0);
        tempStartDate.setHours(tempStartDate.getHours() + timeZoneOffset);

        let tempEndDate = new Date(date);
        tempEndDate.setDate(tempEndDate.getDate() + selectedTelecom.num_of_days_valid - 1);
        tempEndDate.setHours(23);
        tempEndDate.setMinutes(59);
        tempEndDate.setSeconds(0);
        tempEndDate.setHours(tempEndDate.getHours() + timeZoneOffset);

        console.log('tempStartDate', tempStartDate, itinerary.start_date);
        console.log('tempEndDate', tempEndDate, itinerary.end_date);

        let tempItineraryStart = new Date(itinerary.start_date);
        tempItineraryStart.setHours(tempItineraryStart.getHours() + timeZoneOffset);

        let tempItineraryEnd = new Date(itinerary.end_date);
        tempItineraryEnd.setHours(tempItineraryEnd.getHours() + timeZoneOffset);

        if (new Date(tempEndDate) < new Date(tempItineraryStart) || new Date(tempStartDate) > new Date(tempItineraryEnd)) {
            Toast.show({
                type: 'error',
                text1: 'Please select dates within your itinerary!'
            })
            return;
        }

        let diyEventObj = {
            name: selectedTelecom.name,
            start_datetime: tempStartDate,
            end_datetime: tempEndDate,
            location: '',
            remarks: values.remarks ? values.remarks : '',
        }

        console.log("itinerary.itinerary_id", itinerary.itinerary_id);
        console.log("typeId", typeId);
        console.log("diyEventObj", diyEventObj);

        let response = await createDiyEvent(itinerary.itinerary_id, typeId, "telecom", diyEventObj);
        if (response.status) {
            Toast.show({
                type: 'success',
                text1: 'Telecom Package added to itinerary!'
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
        setOpenDate(false);
    }, [setOpenDate]);

    const onConfirm = useCallback(
        ({ date }) => {
            setOpenDate(false);
            setDate(date);
        },
        [setOpenDate, setDate]
    );

    function formatDatePicker(string) {
        const date = new Date(string);
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString([], dateOptions);
    }

    function formatEstimatedPriceTier(text) {
        if (text === 'TIER_1') {
            return '$';
        } else if (text === 'TIER_2') {
            return '$$';
        } else if (text === 'TIER_3') {
            return '$$$';
        } else if (text === 'TIER_4') {
            return '$$$$';
        } else if (text === 'TIER_5') {
            return '$$$$$';
        } else {
            return text;
        }
    }

    function formatDurationCategory(text) {
        if (text === 'ONE_DAY') {
            return '1 DAY';
        } else if (text === 'THREE_DAY') {
            return '3 DAYS';
        } else if (text === 'SEVEN_DAY') {
            return '7 DAYS';
        } else if (text === 'FOURTEEN_DAY') {
            return '14 DAYS';
        } else if (text === 'MORE_THAN_FOURTEEN_DAYS') {
            return '> 14 DAYS';
        } else {
            return text;
        }
    }

    function formatDataLimitCategory(text) {
        if (text === 'VALUE_10') {
            return '10GB';
        } else if (text === 'VALUE_30') {
            return '30GB';
        } else if (text === 'VALUE_50') {
            return '50GB';
        } else if (text === 'VALUE_100') {
            return '100GB';
        } else if (text === 'UNLIMITED') {
            return 'Unlimited';
        } else {
            return text;
        }
    }

    return user && itinerary && selectedTelecom ? (
        <Background style={{ alignItems: 'center' }}>
            {/* restaurant details */}
            <ScrollView automaticallyAdjustKeyboardInsets={true}>
                <View style={styles.topCard}>
                    <Card>
                        <Card.Title style={styles.header}>{selectedTelecom.name} </Card.Title>

                        <Card.Image
                            style={{ padding: 0, height: 200, marginBottom: 20 }}
                            source={{
                                uri: selectedTelecom.image
                            }}
                        />

                        <Text style={styles.subtitle}>
                            <Text style={{ fontWeight: 'bold' }}>Duration: </Text><Text>{selectedTelecom.num_of_days_valid} day(s)</Text>
                        </Text>

                        <View style={styles.tagContainer}>
                            <Text style={[styles.tag, { backgroundColor: 'purple', color: 'white', textAlign: 'center' }]}>{formatEstimatedPriceTier(selectedTelecom.estimated_price_tier)}</Text>
                            <Text style={[styles.tag, { backgroundColor: 'royalblue', color: 'white', textAlign: 'center' }]}>{formatDurationCategory(selectedTelecom.plan_duration_category)}</Text>
                            <Text style={[styles.tag, { backgroundColor: 'green', color: 'white', textAlign: 'center' }]}>{formatDataLimitCategory(selectedTelecom.data_limit_category)}</Text>
                        </View>
                    </Card>
                </View>

                {/* itinerary form */}
                <View style={{ alignItems: 'center', marginTop: 130 }}>
                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 340, height: 100, marginTop: -100 }}>

                        <Text style={{ marginTop: 50, fontWeight: 'bold' }}>Itinerary Dates:</Text>
                        <Text style={{ marginBottom: 20 }}>{formatDatePicker(itinerary.start_date)} - {formatDatePicker(itinerary.end_date)}</Text>
                        <DateButton onPress={() => setOpenDate(true)} uppercase={false} mode="outlined" style={{ marginTop: 0, marginBottom: 0, marginLeft: -5 }}>
                            {date ? `${formatDatePicker(date)}` : 'Pick Start Date'}
                        </DateButton>
                        <DatePickerModal
                            locale="en"
                            mode="single"
                            visible={openDate}
                            date={date}
                            onConfirm={onConfirm}
                            onDismiss={onDismiss}
                        />

                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.label}>Start Time</Text>
                                <DateButton onPress={() => setOpenStartTime(true)} uppercase={false} mode="outlined" style={{ marginTop: 10, marginBottom: -5, marginLeft: 5, width: 115 }}>
                                    {startTime ? `${formatTimePicker(startTime)}` : 'From'}
                                </DateButton>
                                <TimePickerModal
                                    visible={openStartTime}
                                    onDismiss={onStartTimeDismiss}
                                    onConfirm={onStartTimeConfirm}
                                    hours={8}
                                    minutes={0}
                                />
                            </View>
                        </View>

                        <TextInput
                            style={styles.inputFormRemarks}
                            label="Remarks (Optional)"
                            multiline={true}
                            value={values.remarks}
                            onChangeText={(value) => setValues({ ...values, remarks: value })}
                            errorText={values.remarks ? InputValidator.text(values.remarks) : ''}
                        />
                    </View>

                    <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 80 }}>
                        <Button
                            mode="contained"
                            text={"Submit"}
                            onPress={onSubmit}
                        />
                    </View>
                </View>
            </ScrollView>
        </Background>
    ) : (
        <View></View>
    )
}

const styles = StyleSheet.create({
    topCard: {
        height: 410,
    },
    header: {
        textAlign: 'left',
        fontSize: 20,
        color: '#044537',
        flexDirection: 'row',
        fontWeight: 'bold'
    },
    tagContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 5,
    },
    tag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 100,
        fontSize: 11,
        fontWeight: 'bold'
    },
    subtitle: {
        marginBottom: 5,
        fontSize: 15,
        color: 'grey'
    },
    carouselContainer: {
        marginTop: 8,
        marginBottom: 10,
    },

    inputFormRemarks: {
        width: 340,
        marginTop: 5,
        marginBottom: 10,
    },
    label: {
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 20,
        marginLeft: 10,
    }
});

export default CreateTelecomDIYEventScreen