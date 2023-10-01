import React , { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { getPublishedTelecomList } from '../../redux/telecomRedux';

const TelecomScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [data, setData] = useState([]);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    
        const usertype =  await getUserType()
    }

    useEffect(() => {
        const fetchData = async() => {
            let response = await getPublishedTelecomList();
            if (response.status) {
                setData(response.data);
            } else {
                console.log("Telecom list not fetch!");
            }
        };

        fetchUser();
        fetchData();
    }, []);

    const viewTelecomDetails = (id) => {
        navigation.navigate('TelecomDetailsScreen', {id: id}); // set the attraction id here 
    }

    function formatImage(text) {
        if (text === 'ONE_DAY') {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/telecom/telecom_1_day.JPG';
        } else if (text === 'THREE_DAY') {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/telecom/telecom_3_day.JPG';
        } else if (text === 'SEVEN_DAY') {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/telecom/telecom_7_day.JPG';
        } else if (text === 'FOURTEEN_DAY') {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/telecom/telecom_14_day.JPG';
        } else if (text === 'MORE_THAN_FOURTEEN_DAYS') {
            return 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/telecom/telecom_more_than_14_day.JPG';
        } else {
            return text;
        }
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
            return '1 Day';
        } else if (text === 'THREE_DAY') {
            return '3 Days';
        } else if (text === 'SEVEN_DAY') {
            return '7 Days';
        } else if (text === 'FOURTEEN_DAY') {
            return '14 Days';
        } else if (text === 'MORE_THAN_FOURTEEN_DAYS') {
            return '> 14 Days';
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

    return (
        <Background>
            <ScrollView>
                <View style={styles.container}>
                    { 
                        data.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => viewTelecomDetails(item.telecom_id)}>
                            <Card>
                                <Card.Title style={styles.header}>
                                    {item.name} 
                                </Card.Title>
                                <Card.Image
                                    style={{ padding: 0, height: 200}}
                                    source={{
                                    uri: formatImage(item.plan_duration_category)
                                    }}
                                />
                                
                                <Text style={styles.description}>
                                    <Text style={{fontWeight: 'bold'}}>Price: </Text><Text>${item.price}     </Text>
                                    <Text style={{fontWeight: 'bold'}}>Duration: </Text><Text>{item.num_of_days_valid} day(s)    </Text>
                                    <Text style={{fontWeight: 'bold'}}>Data Limit: </Text><Text>{item.data_limit}GB</Text>
                                </Text>
                                <Text style={styles.description}>{item.description}</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={[styles.tag, {backgroundColor:'purple', color: 'white'}]}>{formatEstimatedPriceTier(item.estimated_price_tier)}</Text>
                                    <Text style={[styles.tag, {backgroundColor:'blue', color: 'white'}]}>{formatDurationCategory(item.plan_duration_category)}</Text>
                                    <Text style={[styles.tag, {backgroundColor:'green', color: 'white'}]}>{formatDataLimitCategory(item.data_limit_category)}</Text>
                                </View>
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
    container: {
      flex: 1,
    },
    fonts: {
      marginBottom: 8,
    },
    user: {
      flexDirection: 'row',marginBottom: 6,
    },
    image: {
      width: 30,height: 30,marginRight: 10,
    },
    name: {
      fontSize: 16,marginTop: 5,
    },
    description: {
      marginBottom: 20, fontSize: 13, marginTop : 10 
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
    header:{
        color: '#044537',
        fontSize: 15
    }
});

export default TelecomScreen