
import React, { useState, useEffect, useCallback } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput';
import { getUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
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
    const { typeId, selectedAccommodation, roomList } = route.params;

    const [user, setUser] = useState(null);
    const [accommodation, setAccommodation] = useState(null);
    const [itinerary, setItinerary] = useState(null);
    const [imgList, setImgList] = useState([]);
    const [imageActiveSlide, setImageActiveSlide] = useState(0);
    const [activeSlide, setActiveSlide] = useState(0);
    const [selectedRoomList, setSelectedRoomList] = useState([]);

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

    const timezoneConvert = (time, hour, min, sec) => {
        let temp = new Date(time);
        temp.setHours(hour);
        temp.setMinutes(min);
        temp.setSeconds(sec);
        temp.setHours(temp.getHours() + timeZoneOffset);
        return temp;
    }

    async function onSubmit() {

        if (!startDate || !endDate) {
            Toast.show({
                type: 'error',
                text1: 'Please select a date range!'
            })
            return;
        }

        let tempStartDate = timezoneConvert(new Date(startDate), new Date(selectedAccommodation.check_in_time).getHours(), 0, 0);
        let tempEndDate = timezoneConvert(new Date(new Date(endDate)), new Date(selectedAccommodation.check_out_time).getHours(), 0, 0);
        let tempItiStart = timezoneConvert(new Date(itinerary.start_date), 0, 0, 0);
        let tempItiEnd = timezoneConvert(new Date(itinerary.end_date), 23, 59, 59);

        // console.log('tempStartDate', tempStartDate);
        // console.log('tempEndDate', tempEndDate);
        // console.log('iti start', tempItiStart);
        // console.log('iti end', tempItiEnd);

        if (tempStartDate < tempItiStart || tempEndDate < tempItiStart || tempStartDate > tempItiEnd || tempEndDate > tempItiEnd) {
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
            remarks: selectedRoomList.length > 0 ? 'Considering ' + concatSelRoomList() + ' room(s)' : '',
        }

        // console.log("itinerary.itinerary_id", itinerary.itinerary_id);
        // console.log("typeId", typeId);
        // console.log("diyEventObj", diyEventObj);

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

    function toggleRoomFromSelectedList(roomType) {
        let temp = '';
        if (roomType === 'STANDARD') {
            temp = 'standard';
        } else if (roomType === 'DOUBLE') {
            temp = 'double';
        } else if (roomType === 'SUITE') {
            temp = 'suite';
        } else if (roomType === 'JUNIOR_SUITE') {
            temp = 'junior suite';
        } else {
            temp = 'deluxe suite';
        }

        if (selectedRoomList.includes(temp)) {
            setSelectedRoomList(selectedRoomList.filter((item) => { return item !== temp}))
        } else {
            setSelectedRoomList([...selectedRoomList, temp]);
        }
    }

    function concatSelRoomList() {
        let temp = '';
        for (var i = 0; i < selectedRoomList.length; i++) {
            if (i == 0) {
                temp = temp + selectedRoomList[0];
            } else {
                temp = temp + ' and ' + selectedRoomList[i];
            }
        }
        return temp;
    }

    useEffect(() => {
        if (selectedRoomList.length > 0) {
            concatSelRoomList();
        }
    }, [selectedRoomList.length])

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

                {/* date form */}
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 340, height: 100, marginTop: -80 }}>
                        <Text style={{ marginTop: 50, fontWeight: 'bold' }}>Itinerary Dates:</Text>
                        <Text style={{ marginBottom: 20 }}>{formatDatePicker(itinerary.start_date)} - {formatDatePicker(itinerary.end_date)}</Text>
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
                    </View>
                </View>

                {/* remarks */}
                <View style={{ marginTop: 40 }}>
                    <Text style={{marginLeft: 20, fontWeight: 'bold'}}>Please select rooms you are considering:</Text>
                    <Carousel
                        data={roomList}
                        renderItem={({ item }) => (
                            <TouchableOpacity key={item.room_id} onPress={() => toggleRoomFromSelectedList(item.room_type)}>
                                <Card containerStyle={styles.roomCard}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Image
                                            source={{ uri: item.room_image }}
                                            style={styles.roomImage}
                                        />

                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Card.Title style={styles.header}>{item.room_type.replace(/_/g, ' ')}</Card.Title>
                                            <Text style={styles.details}>
                                                <Text style={styles.boldText}>Amenities:</Text>{' '}
                                                {item.amenities_description}
                                            </Text>
                                            <Text style={styles.details}>
                                                <Text style={styles.boldText}>Pax Capacity:</Text>{' '}
                                                {item.num_of_pax}
                                            </Text>
                                            <Text style={styles.details}>
                                                <Text style={styles.boldText}>Price per Night:</Text>{' '}
                                                ${item.price}
                                            </Text>
                                        </View>
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        )}
                        sliderWidth={400}
                        itemWidth={360}
                        layout={'default'}
                        onSnapToItem={(index) => setActiveSlide(index)}
                    />
                    {selectedRoomList.length > 0 && <Text style={{marginLeft: 30, marginTop: 10 }}>You have selected {concatSelRoomList()} room(s)</Text>}
                </View>
                
                {/* submit button */}
                <View style={{ width: 340, height: 100, marginLeft: 60, marginTop: 10}}>
                    <Button
                        mode="contained"
                        text={"Submit"}
                        onPress={onSubmit}
                    />
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
    roomImage: {
        width: 100, 
        height: 100, 
        marginRight: 10,
    },
    roomCard: {
        margin: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 10,
    },
});

export default CreateAccommodationDIYEventScreen
