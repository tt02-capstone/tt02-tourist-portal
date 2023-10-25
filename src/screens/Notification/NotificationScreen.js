import React , { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import { getUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import Button from '../../components/Button'
import { useRoute } from '@react-navigation/native';
import { sendNotification } from '../../redux/notificationRedux';

const NotificationScreen = ({ navigation }) => {
    const [user, setUser] = useState('');

    const route = useRoute();

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        fetchUser();
    }, []);

    const onSendPressed = async (title, body) => {
        let response = await sendNotification(new Date());
        if (response?.status) {
            console.log('screen success')
        } else {
            console.log('notification failure')
        }
    }

    return (
        <Background>
            <ScrollView>
                <Button style={styles.button} text="Send" mode="contained" onPress={() => onSendPressed("aTitle, aBody")} />
            </ScrollView>
        </Background>
    ) 
}

const styles = StyleSheet.create({
});

export default NotificationScreen