
import React, { useState, useEffect, useCallback } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import { theme } from '../../core/theme'
import TextInput from '../../components/TextInput';
import { getUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button as DateButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
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
import { getRestaurantById, getRestaurantDish } from '../../redux/restaurantRedux';
import { IconButton } from 'react-native-paper';

const CreateRestaurantDIYEventScreen = ({ navigation }) => {

    const isFocused = useIsFocused();
    const route = useRoute();
    const { typeId } = route.params;

    const [user, setUser] = useState(null);
    const [rest, setRest] = useState(null);
    const [dishList, setDishList] = useState([]);
    const [itinerary, setItinerary] = useState(null);
    const [imgList, setImgList] = useState([]);
    const [imageActiveSlide, setImageActiveSlide] = useState(0);

    const [values, setValues] = useState({
        remarks: '',
        // name and location given by restaurant by default
    });

    const [date, setDate] = useState(null);
    const [openDate, setOpenDate] = useState(false);

    const [startTime, setStartTime] = useState(null);
    const [openStartTime, setOpenStartTime] = useState(false);

    const [endTime, setEndTime] = useState(null);
    const [openEndTime, setOpenEndTime] = useState(false);

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

            // get restaurant
            let responseRest = await getRestaurantById(typeId);
            if (responseRest.status) {
                setRest(responseRest.data);
                setImgList(responseRest.data.restaurant_image_list);

                let dishes = await getRestaurantDish(typeId)

                if (dishes.status && dishes.data.length != 0) {
                    const groupedDishes = dishes.data.reduce((acc, dish) => {
                        const type = dish.dish_type;

                        if (!acc[type]) {
                            acc[type] = [];
                        }

                        acc[type].push(dish);
                        return acc;
                    }, {});

                    setDishList(groupedDishes);
                }
            } else {
                console.log("restaurant not fetched!");
            }
        }

        if (isFocused) {
            onLoad();
        }

    }, [isFocused]);

    useEffect(() => {
        console.log("dishList", dishList);
    }, [dishList]);

    // restaurant card functions
    const getColorForType = (label) => {
        const labelColorMap = {
            'KOREAN': 'lightblue',
            'MEXICAN': 'lightgreen',
            'CHINESE': 'orange',
            'WESTERN': 'gold',
            'FAST_FOOD': 'turquoise',
            'JAPANESE': 'lightpink'
        };

        return labelColorMap[label] || 'gray';
    };

    async function onSubmit() {

        if (date == null) {
            Toast.show({
                type: 'error',
                text1: 'Please select a date!'
            })
            return;
        } else if (startTime == null) {
            Toast.show({
                type: 'error',
                text1: 'Please select a start time!'
            })
            return;
        } else if (endTime == null) {
            Toast.show({
                type: 'error',
                text1: 'Please select an end time!'
            })
            return;
        }

        let tempStartDate = new Date(date);
        tempStartDate.setHours(startTime.hours);
        tempStartDate.setMinutes(startTime.minutes);
        tempStartDate.setSeconds(0);
        tempStartDate.setHours(tempStartDate.getHours() + timeZoneOffset);

        let tempEndDate = new Date(date);
        tempEndDate.setHours(endTime.hours);
        tempEndDate.setMinutes(endTime.minutes);
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
        } else if (new Date(tempStartDate) > new Date(tempEndDate)) {
            Toast.show({
                type: 'error',
                text1: 'Start time must be before end time!'
            })
            return;
        }

        let diyEventObj = {
            name: rest.name,
            start_datetime: tempStartDate,
            end_datetime: tempEndDate,
            location: rest.address,
            remarks: values.remarks ? values.remarks : '',
        }

        // console.log("itinerary.itinerary_id", itinerary.itinerary_id);
        // console.log("typeId", typeId);
        // console.log("diyEventObj", diyEventObj);

        let response = await createDiyEvent(itinerary.itinerary_id, typeId, "restaurant", diyEventObj);
        if (response.status) {
            Toast.show({
                type: 'success',
                text1: 'Restaurant added to itinerary!'
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

    // end time form
    const onEndTimeDismiss = useCallback(() => {
        setOpenEndTime(false);
    }, [setOpenEndTime]);

    const onEndTimeConfirm = useCallback(
        (formEndTime) => {
            setEndTime(formEndTime);
            setOpenEndTime(false);
        },
        [setOpenEndTime, setEndTime]
    );

    function formatTimePicker(obj) {
        let date = new Date();
        date.setHours(obj.hours);
        date.setMinutes(obj.minutes);
        return moment(date).format('LT');
    }

    const handleAddToRemarks = (name) => {
        if (!values.remarks) {
            setValues({ ...values, remarks: name });
        } else {
            setValues({ ...values, remarks: values.remarks + ', ' + name });
        }
    };

    const showDishList = Object.keys(dishList).map(type => (
        <Card key={type}>
            <View style={{ width: 305 }}>
                <Text style={styles.header}>{type}</Text>
                {dishList[type].map(dish => (
                    <View key={dish.dish_id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ marginTop: 10, width: 220, flexDirection: 'row' }}>
                            <Text style={{ fontSize: 12 }}>{dish.name}</Text>

                            {/* buffer space */}
                            <Text> </Text>

                            {dish.spicy && <Text style={{ fontSize: 8, color: 'red', fontWeight: 'bold', marginTop: 2 }}>
                                <Icon name="fire" size={10} />
                            </Text>}

                            {/* buffer space */}
                            <Text> </Text>

                            {dish.is_signature && <Text style={{ fontSize: 8, color: 'blue', fontWeight: 'bold', marginTop: 2 }}>
                                <Icon name="thumbs-up" size={10} color='#044537' />
                            </Text>}
                        </View>
                        <Text style={{ marginLeft: 30, marginTop: 10, fontSize: 12, fontWeight: 'bold' }}> $ {dish.price}</Text>
                        <IconButton icon="plus-box" size={15} style={{ marginTop: 15, marginLeft: -1 }} onPress={() => handleAddToRemarks(dish.name)} />
                    </View>
                ))}
            </View>
        </Card>
    ));

    return user && itinerary && rest ? (
        <Background style={{ alignItems: 'center' }}>
            {/* restaurant details */}
            <ScrollView automaticallyAdjustKeyboardInsets={true}>
                <View>
                    <Card>
                        <Card.Title style={styles.header}>{rest.name} </Card.Title>

                        <View style={styles.tagContainer}>
                            <Text style={[styles.typeTag, { backgroundColor: getColorForType(rest.restaurant_type) }, { textAlign: 'center' }]}>
                                {rest.restaurant_type}
                            </Text>
                            <Text style={[styles.tierTag, { backgroundColor: 'purple', color: 'white' }, { textAlign: 'center' },]}>
                                {rest.estimated_price_tier ? rest.estimated_price_tier.replace(/_/g, ' ') : ''}
                            </Text>
                            <Text style={[styles.locationTag, { backgroundColor: 'green', color: 'white', textAlign: 'center' },]}>
                                {rest.generic_location ? rest.generic_location.replace(/_/g, ' ') : ''}
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
                            {rest.address}
                        </Text>

                        <Text style={{ fontSize: 12 }}>
                            <Text style={{ fontWeight: 'bold' }}>Operating Hours:</Text>{' '}
                            {rest.opening_hours}
                        </Text>
                    </Card>

                    <Card containerStyle={styles.dropBorder}>
                        <Card.Title style={styles.header}>
                            Menu
                        </Card.Title>

                        {/* to display the menu  */}
                        <View style={{ justifyContent: 'center', alignItems: 'left', marginLeft: -15, marginTop: -11 }}>
                            {showDishList}
                        </View>
                    </Card>

                    {/* itinerary form */}
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Itinerary Dates:</Text>
                        <Text style={{ marginBottom: 20 }}>{formatDatePicker(itinerary.start_date)} - {formatDatePicker(itinerary.end_date)}</Text>
                        <DateButton onPress={() => setOpenDate(true)} uppercase={false} mode="outlined" style={{ marginTop: 0, marginBottom: 0, marginLeft: -5 }}>
                            {date ? `${formatDatePicker(date)}` : 'Pick Date'}
                        </DateButton>
                        <DatePickerModal
                            locale="en"
                            mode="single"
                            visible={openDate}
                            date={date}
                            onConfirm={onConfirm}
                            onDismiss={onDismiss}
                        />

                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.label}>From</Text>
                            <DateButton onPress={() => setOpenStartTime(true)} uppercase={false} mode="outlined" style={{ marginTop: 10, marginBottom: -5, marginLeft: 5, width: 115 }}>
                                {startTime ? `${formatTimePicker(startTime)}` : 'Start'}
                            </DateButton>
                            <TimePickerModal
                                visible={openStartTime}
                                onDismiss={onStartTimeDismiss}
                                onConfirm={onStartTimeConfirm}
                                hours={8}
                                minutes={0}
                            />

                            <Text style={styles.label}>To</Text>
                            <DateButton onPress={() => setOpenEndTime(true)} uppercase={false} mode="outlined" style={{ marginTop: 10, marginBottom: -5, marginLeft: 5, width: 115 }}>
                                {endTime ? `${formatTimePicker(endTime)}` : 'End'}
                            </DateButton>
                            <TimePickerModal
                                visible={openEndTime}
                                onDismiss={onEndTimeDismiss}
                                onConfirm={onEndTimeConfirm}
                                hours={22}
                                minutes={59}
                            />
                        </View>

                        <TextInput
                            style={{ marginTop: 10, width: '80%', marginLeft: 40 }}
                            label="Remarks (Optional)"
                            multiline={true}
                            value={values.remarks}
                            onChangeText={(value) => setValues({ ...values, remarks: value })}
                            errorText={values.remarks ? InputValidator.text(values.remarks) : ''}
                        />

                        <Button
                            mode="contained"
                            text={"Submit"}
                            style={{ marginBottom: 40 }}
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
    label: {
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 20,
        marginLeft: 10,
    },
    dropBorder: {
        borderWidth: 0,
        shadowColor: 'rgba(0,0,0, 0.0)',
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        backgroundColor: theme.colors.surface,
    },
});

export default CreateRestaurantDIYEventScreen
