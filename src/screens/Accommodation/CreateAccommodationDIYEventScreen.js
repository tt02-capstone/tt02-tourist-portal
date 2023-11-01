
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
import { theme } from '../../core/theme'
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { timeZoneOffset } from "../../helpers/DateFormat";
import { getItineraryByUser } from '../../redux/itineraryRedux';
import { useIsFocused } from "@react-navigation/native";

const CreateAccommodationDIYEventScreen = ({ navigation }) => {

    const isFocused = useIsFocused();
    const route = useRoute();
    const { typeId, selectedAccommodation } = route.params;

    // accommodation card
    const [user, setUser] = useState('');
    const [itinerary, setItinerary] = useState(null);
    const [imageList, setImageList] = useState([]);
    const [imageActiveSlide, setImageActiveSlide] = useState(0);

    // diy event form
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [open, setOpen] = useState(false);

    const [values, setValues] = useState({
        remarks: '',
    });

    useEffect(() => {
        async function onLoad() {
            const userData = await getUser();
            setUser(userData);
            const userId = userData.user_id;

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
            setImageList(selectedAccommodation.accommodation_image_list);
        }

    }, [isFocused]);

    function formatLocalDateTime(localDateTimeString) {
        const dateTime = new Date(localDateTimeString);
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        return dateTime.toLocaleTimeString([], timeOptions);
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

    function formatDatePicker(string) {
        const date = new Date(string);
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString([], dateOptions);
    }

    const getColorForType = (label) => {
        const labelColorMap = {
            'HOTEL': 'lightblue',
            'AIRBNB': 'lightgreen',
        };

        return labelColorMap[label] || 'gray';
    };

    return user && itinerary && selectedAccommodation ? (
        <Background style={{ alignItems: 'center' }}>
            {/* accommodation details */}
            <ScrollView automaticallyAdjustKeyboardInsets={true}>
                <Card>
                    <View style={styles.topCard}>
                        <Card.Title style={styles.header}>
                            {selectedAccommodation.name}
                        </Card.Title>

                        <View style={styles.tagContainer}>
                            <Text style={[styles.tag, { backgroundColor: getColorForType(selectedAccommodation.type), textAlign: 'center' }]}>{selectedAccommodation.type}</Text>
                            <Text style={[styles.tag, { backgroundColor: 'purple', color: 'white', textAlign: 'center' }]}>{selectedAccommodation.estimated_price_tier ? selectedAccommodation.estimated_price_tier.replace(/_/g, ' ') : ''}</Text>
                            <Text style={[styles.locationTag, { backgroundColor: 'green', color: 'white', textAlign: 'center' }]}>{selectedAccommodation.generic_location ? selectedAccommodation.generic_location.replace(/_/g, ' ') : ''}</Text>
                        </View>
                        
                        <View style={styles.carouselContainer}>
                            <Carousel
                                data={imageList}
                                renderItem={renderCarouselItem}
                                sliderWidth={330}
                                itemWidth={330}
                                layout={'default'}
                                onSnapToItem={(index) => setImageActiveSlide(index)}
                            />
                            <Pagination
                                dotsLength={imageList.length} // Total number of items
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

                        <Text style={styles.details}>
                            <Text style={styles.boldText}>Address:</Text>{' '}
                            {selectedAccommodation.address}
                        </Text>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={styles.details}>
                                <Text style={styles.boldText}>Check In Time:</Text>{' '}
                                {formatLocalDateTime(selectedAccommodation.check_in_time)}
                            </Text>
                            <Text style={{fontSize: 12, marginLeft: 10}}>
                                <Text style={styles.boldText}>Check Out Time:</Text>{' '}
                                {formatLocalDateTime(selectedAccommodation.check_out_time)}
                            </Text>
                        </View>
                    </View>
                </Card>
                
                {/* itinerary form */}
                <View style={{ alignItems: 'center', minHeight: '100%' }}>
                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', width: 340, height: 0, marginTop: -500 }}>

                        <View style={{flexDirection: 'row'}}>
                            <DateButton onPress={() => setOpen(true)} uppercase={false} mode="outlined" style={{marginTop: 0, marginBottom: 0, marginLeft: -5}}>
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

                        <TextInput
                            style={styles.description}
                            label="Remarks (Optional)"
                            multiline={true}
                            value={values.remarks}
                            onChangeText={(value) => setValues({ ...values, remarks: value })}
                            errorText={values.remarks ? InputValidator.text(values.remarks) : ''}
                        />

                        <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 0 }}>
                            <Button
                                mode="contained"
                                text={"Submit"}
                                onPress={onSubmit}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Background>
    ) : (
        <View></View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        textAlign: 'left',
        fontSize: 15,
        color: '#044537',
        flexDirection: 'row'
    },
    image: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
    subtitle: {
        marginBottom: 5,
        fontSize: 12,
        color: 'grey'
    },
    description: {
        marginBottom: 10,
        fontSize: 12,
        marginTop: 10
    },
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
    tagContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    locationTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 120,
        fontSize: 11,
        fontWeight: 'bold',
    },
    carouselContainer: {
        flex: 1,
        marginTop: 2,
        marginBottom: 10,
    },
    details: {
        fontSize: 12
    },
    boldText: {
        fontWeight: 'bold',
    },
});

export default CreateAccommodationDIYEventScreen
