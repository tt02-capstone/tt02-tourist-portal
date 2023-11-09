import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import { getUser } from '../../helpers/LocalStorage';
import { Card } from '@rneui/themed';
import { View, ScrollView, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import Ionicons from '@expo/vector-icons/Ionicons';
import { getInvitationsByUser, addUserToItinerary, getItineraryMasterUserEmail } from '../../redux/itineraryRedux';
import moment from 'moment';

const ViewInvitationsScreen = ({ navigation }) => {

    const route = useRoute();
    const [user, setUser] = useState('');
    const [loading, setLoading] = useState(true);
    const [invitations, setInvitations] = useState([]); // list of itinerary objects
    const [masterUsers, setMasterUsers] = useState({}); // store itinerary master user emails

    useEffect(() => {
        async function fetchUser() {
            const userData = await getUser();
            setUser(userData);
        }

        fetchUser();
    }, []);

    useEffect(() => {
        async function fetchInvitations() {
            let response = await getInvitationsByUser(user.user_id);
            if (response.status) {
                setInvitations(response.data);
            } else {
                console.log("Invitations not fetched!");
            }
        }

        if (user) {
            fetchInvitations();
        }

    }, [user]);

    useEffect(() => {
        async function fetchMasterEmails() {
            // Iterate through invitations and fetch the master user's email for each itinerary
            const temp = {};
            for (const invitation of invitations) {
                const response = await getItineraryMasterUserEmail(invitation.master_id);
                if (response) {
                    temp[invitation.itinerary_id] = response.data;
                }
            }
            setMasterUsers(temp);
        }

        if (invitations.length > 0) {
            fetchMasterEmails();
        }
    }, [invitations]);

    const acceptInvitation = async (itineraryId, userId) => {
        let response = await addUserToItinerary(itineraryId, userId);
        if (response.status) {
            Toast.show({
                type: 'success',
                text1: 'Successfully accepted invitation!'
            })

            navigation.reset({
                index: 2,
                routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'ItineraryScreen' }],
            });
        } else {
            console.log("Acceptance failed!");
        }
    }

    return (
        <Background>
            <ScrollView automaticallyAdjustKeyboardInsets={true} >
                {invitations.length > 0 && <Text style={styles.invitationDescription}>You may only be a part of one itinerary at a time.</Text>}

                {invitations.map((item, index) => (
                    <Card key={index} wrapperStyle={{ height: 75 }} containerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Card.Image
                                style={styles.image}
                                source={{
                                    uri: masterUsers[item.itinerary_id]?.profile_pic ? masterUsers[item.itinerary_id]?.profile_pic : 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/default_profile.jpg'
                                }}
                            />
                            <View style={{ flexDirection: 'column' }}>
                                <Card.Title style={styles.header}>{masterUsers[item.itinerary_id]?.email}</Card.Title>
                                <Text style={styles.description}>{masterUsers[item.itinerary_id]?.name}</Text>
                                <Text style={styles.description}>{moment(item.start_date).format('ll')} - {moment(item.end_date).format('ll')}</Text>
                                <Text style={styles.description}>{item.remarks}</Text>
                            </View>

                            <TouchableOpacity style={{flexDirection: 'row', marginLeft: 17 }} onPress={() => acceptInvitation(item.itinerary_id, user.user_id)}>
                                <Ionicons name="people-outline" style={{ color: '#044537', marginTop: 15}} size={20} />
                                <Text style={styles.inviteButton} mode="contained" onPress={() => acceptInvitation(item.itinerary_id, user.user_id)}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                ))}

                {invitations.length == 0 && 
                <View style={{alignItems: 'center', alignContent: 'center', justifyContent: 'center'}}>
                    <Image
                        style={styles.noInviteImage}
                        source={{uri: 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/WithinSG_logo.png'}}
                    />
                    <Text style={{fontSize: 20, marginTop: 10, fontWeight: 'bold', color: '#044537'}}>You have no invites!</Text>
                </View>
                }
            </ScrollView>
        </Background>
    );
}

const styles = StyleSheet.create({
    mainTitle: {
        fontSize: 17,
        color: '#044537',
        fontWeight: 'bold',
        marginTop: 25,
        marginLeft: 30
    },
    invitationDescription: {
        marginTop: 20,
        marginLeft: 30,
        fontWeight: 'bold',
        color: '#044537',
    },
    image: {
        borderRadius: 50 / 2,
        width: 40,
        height: 40,
        marginTop: 5,
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
        marginBottom: 2,
        marginLeft: 14,
        textAlign: 'left',
        fontSize: 17,
    },
    description: {
        marginLeft: 15,
    },
    inviteButton: {
        marginLeft: -90,
        marginTop: 17,
        height: 50,
        width: 150,
        fontSize: 16,
        color: '#044537',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    noInviteImage: {
        marginTop: 200,
        marginBottom: 20,
        borderRadius: 130 / 2,
        width: 130,
        height: 130,
    },
});

export default ViewInvitationsScreen