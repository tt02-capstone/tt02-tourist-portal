import React, {useEffect, useState} from 'react'
import {StyleSheet, View, Image, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native'
import { Card } from '@rneui/themed';
import { useRoute } from '@react-navigation/native';
import Background from '../../components/Background'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { viewUserProfile, getPrimaryBadge } from '../../redux/userRedux';

export const ForumProfileScreen = ({navigation}) => {

    const route = useRoute();
    const [user, setUser] = useState('');
    const [badge, setBadge] = useState('');
    const { catId, postId, userId } = route.params;

    async function fetchUser() {
        const response = await viewUserProfile(userId)
        if (response.status) {
            setUser(response.data);
        } else {
            console.log("User not fetched!");
        }
    }

    async function fetchBadge() {
        const response = await getPrimaryBadge(userId)
        if (response.status) {
            setBadge(response.data);
        } else {
            console.log("Badge not fetched!");
        }
    }

    useEffect(() => {
        fetchUser();
        fetchBadge();
    }, []);

    function formatBadgeName(name) {
        const words = name.split('_');
        const formattedName = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        return formattedName;
    }

    function badgeDetails(name) {
        if (name == "FOODIE") {
            return "Unlocked After Creating 2 Restaurant Related Posts"
        } else if (name == "ATTRACTION_EXPERT") {
            return "Unlocked After Creating 2 Attraction Related Posts"
        } else if (name == "ACCOMMODATION_EXPERT") {
            return "Unlocked After Creating 2 Accommodation Related Posts"
        } else if (name == "TELECOM_EXPERT") {
            return "Unlocked After Creating 2 Telecom Related Posts"
        } else {
            return "Unlocked After Creating 4 Posts on Forum"
        }
    }

    const [index, setIndex] = React.useState(0);
    const layout = useWindowDimensions();
    const [routes] = React.useState([
        { key: 'first', title: 'Post' },
        { key: 'second', title: 'Comment' },
        { key: 'third', title: 'Badge' },
    ]);

    return user ? (
        <Background>
            <ScrollView style={{height: 720, width: 350, marginLeft: -15}}>
                <View style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={styles.title} >{user.name}</Text>
                    </View>

                    <Image
                        style={styles.image}
                        source={{uri: user.profile_pic ? user.profile_pic : 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/default_profile.jpg'}}
                    />
                </View>

                <TabView
                    navigationState={{ index, routes }}
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                    renderScene={({ route }) => {}}
                    renderTabBar={props => (
                        <TabBar
                        {...props}
                        indicatorStyle={{ backgroundColor: 'white' }} // the line below the tab
                        style={{ backgroundColor: 'rgba(4, 69, 55, 0.85)', height: 50  }} 
                        labelStyle={{ fontSize: 15, fontWeight:'bold' }}
                        />
                    )}
                />

                {/* post */}
                {index === 0 && user.post_list && 
                    <View>
                        <Text style={{marginTop: 10, marginLeft: 15, fontWeight: 'bold', fontSize: 15}} >{user.post_list.length} Lifetime Post(s)</Text>
                        {user.post_list.map((item, index) => (
                            <View key={index} style={{width: 350 }}>
                                <Card>
                                    <Card.Title style={styles.header}>
                                        {item.title}
                                    </Card.Title>
                                </Card>
                            </View>
                            ))
                        }
                    </View>
                }

                {/* comment */}
                {index === 1 && user.comment_list && 
                    <View>
                        <Text style={{marginTop: 10, marginLeft: 15, fontWeight: 'bold', fontSize: 15}} >{user.comment_list.length} Lifetime Comment(s)</Text>
                        {user.comment_list.map((item, index) => (
                            <View key={index} style={{width: 350 }}>
                                <Card>
                                    <Card.Title style={styles.header}>
                                        {item.content}
                                    </Card.Title>
                                </Card>
                            </View>
                            ))
                        }
                    </View>
                }

                {/* badge */}
                {index === 2 && badge && 
                    <View>
                        <Text style={{marginTop: 10, marginLeft: 15, fontWeight: 'bold', fontSize: 15}} >Primary Badge</Text>
                        <Card>
                            <Image source={{ uri: "https://tt02.s3.ap-southeast-1.amazonaws.com/static/badges/" + badge.badge_type + ".png" }} style={{ width: 250, height: 200 }} />
                            <Text style={{ fontSize: 20 ,textAlign: 'center', fontWeight:'bold', marginTop:10}}>{formatBadgeName(badge.badge_type)}</Text>
                            <Text style={{ fontSize: 8 ,textAlign: 'center', fontWeight:'bold', marginTop:6, color:'grey'}}> {badgeDetails(badge.badge_type)} </Text>
                        </Card>
                    </View>
                }

            </ScrollView>
        </Background>
    ) : (
        <Background></Background>
    )
}

const styles = StyleSheet.create({
    title: {
        marginTop: 20,
        fontSize: 25,
        fontWeight: 'bold',
        color:  '#044537',
    },
    image: {
        marginTop: 15,
        marginBottom: 20,
        borderRadius: 180 / 2,
        width: 180,
        height: 180,
    },
});