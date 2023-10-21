import React, {useEffect, useState} from 'react'
import {StyleSheet, View, Image, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native'
import { Card } from '@rneui/themed';
import { useRoute } from '@react-navigation/native';
import Background from '../../components/Background'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { viewUserProfile } from '../../redux/userRedux';

export const ForumProfileScreen = ({navigation}) => {

    const route = useRoute();
    const [user, setUser] = useState('');
    const { catId, postId, userId } = route.params;

    async function fetchUser() {
        const response = await viewUserProfile(userId)
        if (response.status) {
            setUser(response.data);
        } else {
            console.log("User not fetched!");
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    const [index, setIndex] = React.useState(0);
    const layout = useWindowDimensions();
    const [routes] = React.useState([
        { key: 'first', title: 'Posts' },
        { key: 'second', title: 'Comments' },
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