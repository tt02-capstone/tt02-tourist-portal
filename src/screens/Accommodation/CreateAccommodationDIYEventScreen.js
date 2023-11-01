
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
import Carousel, { Pagination } from 'react-native-snap-carousel';
import moment from 'moment';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { timeZoneOffset } from "../../helpers/DateFormat";
import { getItineraryByUser } from '../../redux/itineraryRedux';
import { useIsFocused } from "@react-navigation/native";
import { set } from 'date-fns';

const CreateAccommodationDIYEventScreen = ({ navigation }) => {

    const isFocused = useIsFocused();
    const route = useRoute();
    const { typeId, selectedAccommodation } = route.params;

    const [user, setUser] = useState(null);
    const [accommodation, setAccommodation] = useState(null);
    const [itinerary, setItinerary] = useState(null);
    const [imgList, setImgList] = useState([]);
    const [imageActiveSlide, setImageActiveSlide] = useState(0);

    const [values, setValues] = useState({
        remarks: '',
        // name and location given by accommodation by default
    });

    // diy event form
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [open, setOpen] = useState(false);

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

            setAccommodation(selectedAccommodation);
            setImgList(selectedAccommodation.accommodation_image_list);
        }

        if (isFocused) {
            onLoad();
        }

    }, [isFocused]);

    const getColorForType = (label) => {
        const labelColorMap = {
            'HOTEL': 'lightblue',
            'AIRBNB': 'lightgreen',
        };

        return labelColorMap[label] || 'gray';
    };

    async function onSubmit() {

        let tempStartDate = new Date(startDate);
        tempStartDate.setHours(new Date(selectedAccommodation.check_in_time).getHours());
        tempStartDate.setMinutes(0);
        tempStartDate.setSeconds(0);
        tempStartDate.setHours(tempStartDate.getHours() + timeZoneOffset);

        let tempEndDate = new Date(endDate);
        tempEndDate.setHours(new Date(selectedAccommodation.check_out_time).getHours());
        tempEndDate.setMinutes(0);
        tempEndDate.setSeconds(0);
        tempEndDate.setHours(tempEndDate.getHours() + timeZoneOffset);

        // console.log('tempStartDate', tempStartDate);
        // console.log('tempEndDate', tempEndDate);

        if (new Date(tempEndDate) < new Date(itinerary.start_date) || new Date(tempStartDate) > new Date(itinerary.end_date)) {
            Toast.show({
                type: 'error',
                text1: 'Please select dates within your itinerary!'
            })
            return;
        }

        let diyEventObj = {
            name: selectedAccommodation ? selectedAccommodation.name : '',
            start_datetime: tempStartDate,
            end_datetime: tempEndDate,
            location: selectedAccommodation ? selectedAccommodation.address : '',
            remarks: values.remarks ? values.remarks : '',
        }

        console.log("itinerary.itinerary_id", itinerary.itinerary_id);
        console.log("typeId", typeId);
        console.log("diyEventObj", diyEventObj);

        let response = await createDiyEvent(itinerary.itinerary_id, typeId, "accommodation", diyEventObj);
        if (response.status) {
            Toast.show({
                type: 'success',
                text1: 'Accommodation added to itinerary!'
            })

            navigation.reset({
                index: 2,
                routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'ItineraryScreen' }],
            });

        } else {
            console.log('error');
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
            setOpen(false);
            setStartDate(startDate);
            setEndDate(endDate);
        },
        [setOpen, setStartDate, setEndDate]
    );

    function formatDatePicker(string) {
        const date = new Date(string);
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString([], dateOptions);
    }

    function formatLocalDateTime(localDateTimeString) {
        const dateTime = new Date(localDateTimeString);
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        return dateTime.toLocaleTimeString([], timeOptions);
    }

    return user && itinerary && accommodation ? (
        <Background style={{ alignItems: 'center' }}>
            {/* accommodation details */}
            <ScrollView automaticallyAdjustKeyboardInsets={true}>
                <View style={styles.topCard}>
                    <Card>
                        <Card.Title style={styles.header}>{accommodation.name} </Card.Title>

                        <View style={styles.tagContainer}>
                            <Text style={[styles.typeTag, { backgroundColor: getColorForType(accommodation.type) }, { textAlign: 'center' }]}>
                                {accommodation.type}
                            </Text>
                            <Text style={[styles.tierTag, { backgroundColor: 'purple', color: 'white' }, { textAlign: 'center' },]}>
                                {accommodation.estimated_price_tier ? accommodation.estimated_price_tier.replace(/_/g, ' ') : ''}
                            </Text>
                            <Text style={[styles.locationTag, { backgroundColor: 'green', color: 'white', textAlign: 'center' },]}>
                                {accommodation.generic_location ? accommodation.generic_location.replace(/_/g, ' ') : ''}
                            </Text>
                        </View>

                        <View style={styles.carouselContainer}>
                            <Carousel
                                data={imgList}
                                renderItem={renderCarouselItem}
                                sliderWidth={330}
                                itemWidth={330}
                                layout={'default'}
                                onSnapToItem={(index) => setImageActiveSlide(index)}
                            />
                            <Pagination
                                dotsLength={imgList.length} // Total number of items
                                activeDotIndex={imageActiveSlide} // Current active slide index
                                containerStyle={{ paddingVertical: 10, marginTop: 5 }}
                                dotStyle={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: 5,
                                    backgroundColor: 'rgba(0, 0, 0, 0.92)',
                                }}
                                inactiveDotOpacity={0.4}
                                inactiveDotScale={0.6}
                            />
                        </View>

                        <Text style={{ fontSize: 12 }}>
                            <Text style={{ fontWeight: 'bold' }}>Address:</Text>{' '}
                            {accommodation.address}
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 12 }}>
                                <Text style={styles.boldText}>Check In Time:</Text>{' '}
                                {formatLocalDateTime(selectedAccommodation.check_in_time)}
                            </Text>
                            <Text style={{ fontSize: 12, marginLeft: 10 }}>
                                <Text style={styles.boldText}>Check Out Time:</Text>{' '}
                                {formatLocalDateTime(selectedAccommodation.check_out_time)}
                            </Text>
                        </View>
                    </Card>
                </View>

                {/* itinerary form */}
                <View style={{ alignItems: 'center', marginTop: 120 }}>
                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 340, height: 100, marginTop: -80 }}>

                        <DateButton onPress={() => setOpen(true)} uppercase={false} mode="outlined" style={{ marginTop: 0, marginBottom: 0, marginLeft: -5 }}>
                            {startDate && endDate ? `${formatDatePicker(startDate)} - ${formatDatePicker(endDate)}` : 'Pick Date Range'}
                        </DateButton>
                        <DatePickerModal
                            locale="en"
                            mode="range"
                            visible={open}
                            startDate={startDate}
                            endDate={endDate}
                            onConfirm={onConfirm}
                            onDismiss={onDismiss}
                        />

                        <TextInput
                            style={styles.inputFormRemarks}
                            label="Remarks (Optional)"
                            multiline={true}
                            value={values.remarks}
                            onChangeText={(value) => setValues({ ...values, remarks: value })}
                            errorText={values.remarks ? InputValidator.text(values.remarks) : ''}
                        />
                    </View>

                    <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 30 }}>
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
        fontSize: 13,
        color: '#044537',
        flexDirection: 'row',
        fontWeight: 'bold'
    },
    tagContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 5,
    },
    typeTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 85,
        fontSize: 9,
        fontWeight: 'bold',
    },
    tierTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 50,
        fontSize: 9,
        fontWeight: 'bold',
    },
    locationTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 80,
        fontSize: 8,
        fontWeight: 'bold',
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
    },
    boldText: {
        fontWeight: 'bold',
    },
});

export default CreateAccommodationDIYEventScreen
