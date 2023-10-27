import React , { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import { getUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Card } from '@rneui/themed';
import moment from 'moment';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getUserNotification, updateNotification } from '../../redux/notificationRedux';

const NotificationScreen = ({ navigation }) => {

    const [user, setUser] = useState('');
    const [fetchData, setFetchData] = useState(true);
    const [dataList, setDataList] = useState([]);

    const route = useRoute();

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchDataFunc = async () => {
            let response = await getUserNotification(user.user_id);
            if (response.status) {
                setDataList(response.data);
                setFetchData(false);
            } else {
                console.log("Notification list not fetched!");
            }
        }

        if (user && fetchData) {
            fetchDataFunc();
        }
    }, [user, fetchData])

    const onPressed = async (notificationId) => {
        let response = await updateNotification(notificationId);
        if (response.status) {
            setFetchData(true);
            console.log('update notification success')
        } else {
            Toast.show({
                type: 'error',
                text1: "Notification not read!"
            })
            console.log('update notification failure')
        }
    }

    return (
        <Background style={{alignItems: 'center' }}>
            <ScrollView style={{marginTop: 15}}>
                <View>
                    {dataList.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.card} onPress={() => onPressed(item.notification_id)}>
                            <Card>
                                <Card.Title style={styles.header}>
                                    <View style={{flexDirection: 'row'}}>
                                        <Card.Image
                                                style={styles.image}
                                                source={{uri: 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/WithinSG_logo.png'
                                            }}
                                        />
                                        <View style={{flexDirection: 'column'}}>
                                            <Card.Title style={styles.header}>{item.title}</Card.Title>
                                            <Text style={styles.description}>{item.body} is about to start. Are you excited?</Text>

                                            <View style={{flexDirection: 'row'}}>
                                                {item.is_read && <Ionicons name="checkmark" size={20} color='#044537' style={{marginTop: 8, marginLeft: 130, marginRight: -12}} />}
                                                {item.is_read && <Ionicons name="checkmark" size={20} color='#044537' style={{marginTop: 8 }} />}
                                                {item.is_read && <Text style={{marginLeft: 10, marginTop: 10, fontSize: 12}}>{moment(item.created_datetime).format('dddd, LT')}</Text>}

                                                {!item.is_read && <Text style={{marginLeft: 165, marginTop: 10, fontSize: 12}}>{moment(item.created_datetime).format('dddd, LT')}</Text>}
                                            </View>
                                        </View>
                                    </View>
                                </Card.Title>
                            </Card>
                        </TouchableOpacity>
                    ))
                    }
                </View>
            </ScrollView>
        </Background>
    ) 
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        height: 100,
    },
    header: {
        color: '#044537',
        marginBottom: 5,
        marginLeft: 12,
        textAlign: 'left'
    },
    image: {
        borderRadius: 50 / 2,
        width: 40,
        height: 40,
        marginLeft: 0,
        marginTop: 8
    },
    description: {
        marginLeft: 15,
        marginBottom: -7,
    }
});

export default NotificationScreen