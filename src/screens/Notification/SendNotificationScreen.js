import React , { useState, useEffect, useCallback } from 'react'
import Background from '../../components/CardBackground'
import { getUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import Button from '../../components/Button'
import { useRoute } from '@react-navigation/native';
import { sendNotification } from '../../redux/notificationRedux';
import { Button as DateButton } from 'react-native-paper';
import moment from 'moment';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { timeZoneOffset } from "../../helpers/DateFormat";
import { createDiyEvent } from '../../redux/diyEventRedux';

const SendNotificationScreen = ({ navigation }) => {
    const [user, setUser] = useState('');

    const route = useRoute();

    // date
    const [openFormDate, setOpenFormDate] = useState(false);
    const [formDate, setFormDate] = useState(undefined);

    // time
    const [openFormTime, setOpenFormTime] = useState(false);
    const [formTime, setFormTime] = useState(undefined);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        fetchUser();
    }, []);

    const onFormDateDismiss = useCallback(() => {
        setOpenFormDate(false);
    }, [setOpenFormDate]);

    const onFormDateConfirm = useCallback(
        ({ date }) => {
            setOpenFormDate(false);
            setFormDate(date);
        },
        [setOpenFormDate, setFormDate, onFormDateDismiss]
    );

    function formatDatePicker(string) {
        const date = new Date(string);
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString([], dateOptions);
    }

    // start time form
    const onFormTimeDismiss = useCallback(() => {
        setOpenFormTime(false);
    }, [setOpenFormTime]);

    const onFormTimeConfirm = useCallback(
        (formTime) => {
            setFormTime(formTime);
            setOpenFormTime(false);
        },
        [setOpenFormTime, setFormTime, onFormTimeDismiss]
    );

    function formatTimePicker(obj) {
        let date = new Date();
        date.setHours(obj.hours);
        date.setMinutes(obj.minutes);
        return moment(date).format('LT');
    }

    const onSendPressed = async () => {
        if (formDate && formTime) {
            let tempDate = new Date(formDate);
            tempDate.setHours(formTime.hours);
            tempDate.setMinutes(formTime.minutes);
            tempDate.setHours(tempDate.getHours() + timeZoneOffset);

            let response = await sendNotification(user.user_id, tempDate);
            if (response?.status) {
                setFormDate(undefined);
                setFormTime(undefined);
                console.log('send notification success')
            } else {
                console.log('send notification failure');
            }
        } else {
            Toast.show({
                type: 'error',
                text1: "Please select a date and time!"
            })
        }
    }

    return (
        <Background style={{alignItems: 'center'}}>
            <View style={{marginTop: 100}}>

                <DateButton onPress={() => setOpenFormDate(true)} uppercase={false} mode="outlined" style={{width: 300}}>
                    {formDate ? `${formatDatePicker(formDate)}` : 'Select Date'}
                </DateButton>
                <DatePickerModal
                    locale="en"
                    mode="single"
                    visible={openFormDate}
                    onDismiss={onFormDateDismiss}
                    date={formDate}
                    onConfirm={onFormDateConfirm}
                />

                <DateButton onPress={() => setOpenFormTime(true)} uppercase={false} mode="outlined" style={{marginTop: 10, marginBottom: -5, width: 300}}>
                    {formTime ? `${formatTimePicker(formTime)}` : 'Select Time'}
                </DateButton>
                <TimePickerModal
                    visible={openFormTime}
                    onDismiss={onFormTimeDismiss}
                    onConfirm={onFormTimeConfirm}
                    hours={8}
                    minutes={0}
                />

                <View style={{alignItems: 'center', marginTop: 20}}>
                    <Button style={styles.button} text="Send" mode="contained" onPress={() => onSendPressed()} />
                </View>
            </View>
        </Background>
    ) 
}

const styles = StyleSheet.create({
    button: {
        
    }
});

export default SendNotificationScreen