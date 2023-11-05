import React, { useState, useEffect, useCallback } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput';
import { getUser } from '../../helpers/LocalStorage';
import { Card } from '@rneui/themed';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'
import { Icon } from '@rneui/themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getAcceptedUsers, getInvitedUsers, getItineraryByUser, getUserWithEmailSimilarity, toggleItineraryInvite } from '../../redux/itineraryRedux';

const InviteFriendScreen = ({ navigation }) => {

    const route = useRoute();
    const { itineraryId } = route.params;
    const [user, setUser] = useState('');

    const [loading, setLoading] = useState(true);
    const [fetchItinerary, setFetchItinerary] = useState(true);
    const [itinerary, setItinerary] = useState();

    const [searchString, setSearchString] = useState('');
    const [originalSearchData, setOriginalSearchData] = useState([]);
    const [searchData, setSearchData] = useState([]);

    const [invitedUsers, setInvitedUsers] = useState([]);
    const [acceptedUsers, setAcceptedUsers] = useState([]);

    useEffect(() => {
        async function fetchUser() {
            const userData = await getUser();
            setUser(userData);
        }

        fetchUser();
    }, []);

    useEffect(() => {
        async function loadItinerary() {
            let response = await getItineraryByUser(user.user_id);
            if (response.status) {
                setItinerary(response.data);
            } else {
                console.log("Itinerary not fetched!");
            }
        }

        if (fetchItinerary && user) {
            loadItinerary();
            setFetchItinerary(false);
        }

    }, [fetchItinerary, user]);

    useEffect(() => {
        async function loadOriginalUsers() {
            let response = await getUserWithEmailSimilarity(user.user_id, itinerary.itinerary_id, undefined);
            if (response.status) {
                setOriginalSearchData(response.data); // contains all user except master user, any user in accepted or invited list
                setSearchData(response.data);
            } else {
                console.log("Itinerary not fetched!");
            }
        }

        async function loadInvitedUsers() {
            let response = await getInvitedUsers(itinerary.itinerary_id);
            if (response.status) {
                setInvitedUsers(response.data);
            } else {
                console.log("Invited users not fetched!");
            }
        }

        async function loadAcceptedUsers() {
            let response = await getAcceptedUsers(itinerary.itinerary_id);
            if (response.status) {
                setAcceptedUsers(response.data);
            } else {
                console.log("Invited users not fetched!");
            }
        }

        if (itinerary) {
            loadOriginalUsers();
            loadInvitedUsers();
            loadAcceptedUsers();
            setLoading(false);
        }

    }, [itinerary]);

    const onSearchPressed = async () => {
        if (searchString.length === 0 || searchString === '') { // show all users
            setSearchData(originalSearchData);

        } else {
            let response = await getUserWithEmailSimilarity(user.user_id, itinerary.itinerary_id, searchString);
            if (response.status) {
                console.log(response.data);
                setSearchData(response.data);

            } else {
                setSearchData(originalSearchData); // show all users
                console.log("user data list not fetched!");
            }
        }
    }

    const onToggleItineraryInvitePressed = async (involvedUserId) => {
        setLoading(true);
        let response = await toggleItineraryInvite(itinerary.itinerary_id, involvedUserId);
        if (response.status) {
            Toast.show({
                type: 'success',
                text1: response.data
            });
            setFetchItinerary(true);
        } else {
            console.log("toggle unsuccessful!");
        }
    }

    return !loading ? (
        <Background style={{ alignItems: 'center', justifyContent: 'center' }}>
            <ScrollView automaticallyAdjustKeyboardInsets={true} >
                {/* Already part of itinerary */}
                <View>
                    <Text style={styles.mainTitle} >Accepted Friends</Text>
                    {acceptedUsers.map((item, index) => (
                    <Card key={index} >
                        <Card.Title style={styles.title}>
                            <View style={{flexDirection: 'row'}}>
                                <Card.Image
                                        style={styles.image}
                                        source={{uri: item.profile_pic ? item.profile_pic : 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/default_profile.jpg'
                                    }}
                                />
                                <View style={{flexDirection: 'column'}}>
                                    <Card.Title style={styles.header}>{item.email}</Card.Title>
                                    <Text style={styles.description}>{item.name}</Text>
                                </View>

                                <View>
                                    <Button style={styles.inviteButton} text="Invite" mode="contained" onPress={() => onToggleItineraryInvitePressed(item.user_id)} />
                                </View>
                            </View>
                        </Card.Title>
                    </Card>
                ))}
                </View>

                {/* Already invited */}
                <View>
                    <Text style={styles.mainTitle}>Invited Friends</Text>
                    {invitedUsers.map((item, index) => (
                    <Card key={index} >
                        <Card.Title style={styles.title}>
                            <View style={{flexDirection: 'row'}}>
                                <Card.Image
                                        style={styles.image}
                                        source={{uri: item.profile_pic ? item.profile_pic : 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/default_profile.jpg'
                                    }}
                                />
                                <View style={{flexDirection: 'column'}}>
                                    <Card.Title style={styles.header}>{item.email}</Card.Title>
                                    <Text style={styles.description}>{item.name}</Text>
                                </View>

                                <View style={{flexDirection: 'row'}}>
                                    <Text style={styles.inviteButton} mode="contained" onPress={() => onToggleItineraryInvitePressed(item.user_id)}>Remove</Text>
                                </View>
                            </View>
                        </Card.Title>
                    </Card>
                ))}
                </View>

                {/* Search for friends */}
                <View style={styles.searchView}>
                    <Text style={styles.mainTitle}>Yet to add a friend? Invite now!</Text>
                    <View style={{flexDirection: 'row'}}>
                        <TextInput
                            style={{width: 300, marginLeft: 20, marginRight: 0}}
                            label="Search email..."
                            returnKeyType="next"
                            value={searchString}
                            onChangeText={(searchVal) => setSearchString(searchVal)}
                        />

                        <TouchableOpacity style={{marginLeft: -50, marginTop: 30}} onPress={onSearchPressed} >
                            <Ionicons name="search-outline" style={{ color: 'black'}} size={25}/> 
                        </TouchableOpacity>
                    </View>
                </View>

                {/* user list */}
                {searchData.map((item, index) => (
                    <Card key={index} >
                        <Card.Title style={styles.title}>
                            <View style={{flexDirection: 'row'}}>
                                <Card.Image
                                        style={styles.image}
                                        source={{uri: item.profile_pic ? item.profile_pic : 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/default_profile.jpg'
                                    }}
                                />
                                <View style={{flexDirection: 'column'}}>
                                    <Card.Title style={styles.header}>{item.email}</Card.Title>
                                    <Text style={styles.description}>{item.name}</Text>
                                </View>

                                <View style={{flexDirection: 'row'}}>
                                    <Text style={styles.inviteButton} mode="contained" onPress={() => onToggleItineraryInvitePressed(item.user_id)}>Invite</Text>
                                </View>
                            </View>
                        </Card.Title>
                    </Card>
                ))}
            </ScrollView>
        </Background>
    ) : (
        <Background style={{ alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator animating={true} />
        </Background>
    )
}

const styles = StyleSheet.create({
    mainTitle: {
        fontSize: 17,
        color: '#044537',
        fontWeight: 'bold',
        marginLeft: 20,
        marginTop: 15,
    },
    searchView: {
        minWidth: '100%',
        // backgroundColor: 'lightblue',
    },
    image: {
        borderRadius: 50 / 2,
        width: 40,
        height: 40,
        marginLeft: 0,
        marginTop: 0
    },
    title: {
        color: '#044537',
        marginBottom: 5,
        marginLeft: 0,
        textAlign: 'left',
        height: 37,
        // backgroundColor: 'blue',
    },
    header: {
        color: '#044537',
        marginBottom: 5,
        marginLeft: 14,
        textAlign: 'left',
        fontSize: 17,
    },
    description: {
        marginLeft: 15,
        marginBottom: -7,
    },
    inviteButton: {
        marginLeft: -40,
        marginTop: 15,
        height: 50,
        width: 150,
        fontSize: 16,
        color: '#044537',
        fontWeight: 'bold',
        textAlign: 'right',
    },
});

export default InviteFriendScreen