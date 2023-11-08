import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Image, ScrollView } from 'react-native'
import { useIsFocused } from "@react-navigation/native";
import { storeUser, getUser } from '../../helpers/LocalStorage'
import Background from '../../components/CardBackground'
import { retrieveBadgesByUserId, markBadgeAsPrimary, getPrimaryBadge, getAllBadgeTypes, getBadgeProgress } from '../../redux/userRedux';
import { Button } from 'react-native-paper';
import { Text, Card } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from "react-native-toast-message";
import * as Progress from 'react-native-progress';

window.Buffer = window.Buffer || require("buffer").Buffer;

export const BadgesScreen = ({ route, navigation }) => {

    const [fetchBadge, setFetchBadge] = useState(false);
    const isFocused = useIsFocused();
    const [user, setUser] = useState();
    const [badges, setBadges] = useState();
    const [badgeTypes, setBadgeTypes] = useState();
    const [badgeProgress, setBadgeProgress] = useState();
    const [refresh, setRefresh] = useState(false);
    const [progressValues, setProgressValues] = useState({
        FOODIE: 0,
        ATTRACTION_EXPERT: 0,
        ACCOMMODATION_EXPERT: 0,
        TELECOM_EXPERT: 0,
        TOUR_EXPERT: 0,
        TOP_CONTRIBUTOR: 0
    });

    useEffect(() => {
        async function fetchData() {
            const userData = await getUser()
            setUser(userData)
            let badgeResponse = await retrieveBadgesByUserId(userData.user_id);
            if (badgeResponse.status) {
                setBadges(badgeResponse.data);

                let badgeTypesResponse = await getAllBadgeTypes(userData.user_id);
                if (badgeTypesResponse.status) {
                    const filteredBadgeTypes = badgeTypesResponse.data.filter(
                        (type) => !badges || badges.length === 0 || !badges.some((badge) => badge.badge_type === type)
                    );
                    setBadgeTypes(filteredBadgeTypes);

                    let badgeProgressResponse = await getBadgeProgress(userData.user_id);
                    if (badgeProgressResponse.status) {
                        setBadgeProgress(badgeProgressResponse.data);
                        setProgressValues(prevValues => ({
                            ...prevValues,
                            FOODIE: badgeProgressResponse.data.foodie,
                            ATTRACTION_EXPERT: badgeProgressResponse.data.attraction_EXPERT,
                            ACCOMMODATION_EXPERT: badgeProgressResponse.data.accommodation_EXPERT,
                            TELECOM_EXPERT: badgeProgressResponse.data.telecom_EXPERT,
                            TOUR_EXPERT: badgeProgressResponse.data.tour_EXPERT,
                            TOP_CONTRIBUTOR: badgeProgressResponse.data.top_CONTRIBUTOR
                        }));

                        const sortedBadgeTypes = badgeTypes.sort((a, b) => {
                            const progressDiff = progressValues[b.toUpperCase()] - progressValues[a.toUpperCase()];
                            if (progressDiff === 0) {
                                if (a.toUpperCase() < b.toUpperCase()) {
                                    return -1;
                                }
                                if (a.toUpperCase() > b.toUpperCase()) {
                                    return 1;
                                }
                                return 0;
                            } else {
                                return progressDiff;
                            }
                        });
                        setBadgeTypes(sortedBadgeTypes);
                    } else {
                        console.log("Error fetching badge progress!");
                    }
                } else {
                    console.log("Error fetching badge types!");
                }
            } else {
                console.log("Badges not shown!");
            }
        }

        if (isFocused || fetchBadge || refresh) {
            fetchData();
            setRefresh(false);
        }
    }, [isFocused, fetchBadge, refresh])

    function formatBadgeName(name) {
        const words = name.split('_');
        const formattedName = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        if (formattedName == "Foodie") {
            return "Foodie Expert"
        }
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
        } else if (name == "TOUR_EXPERT") {
            return "Unlocked After Creating 2 Tour Related Posts"
        } else {
            return "Unlocked After Creating 4 Posts on Forum"
        }
    }

    const setPrimary = async (badge_id, userId) => {
        let response = await markBadgeAsPrimary(badge_id, userId);
        let response2 = await getPrimaryBadge(userId);
        console.log(response2)
        if (response.status) {
            Toast.show({
                type: 'success',
                text1: 'Badge has been set as primary!'
            });
        } else {
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
        setRefresh(true)
    }

    return user ? (
        <Background>
            <ScrollView>
                {badges && badges.length > 0 && user &&
                    <View style={styles.container}>
                        {badges.map((badge, index) => (
                            <Card key={index}>
                                {!badge.is_primary ? (
                                    <Button mode="text" onPress={() => setPrimary(badge.badge_id, user.user_id)} style={{ width: "50%", marginTop: -10, marginLeft: -25 }}>
                                        <Icon name="bookmark" size={12} color='#044537' />
                                        <Text style={{ color: '#044537', fontSize: 10, fontWeight: 'bold' }}> Mark as Primary </Text>
                                    </Button>
                                ) : (
                                    <Text style={{ color: 'red', fontSize: 10, fontWeight: 'bold' }}> PRIMARY </Text>
                                )
                                }
                                <Image source={{ uri: "https://tt02.s3.ap-southeast-1.amazonaws.com/static/badges/" + badge.badge_type + ".png" }} style={{ width: 200, height: 200, marginLeft: 55, marginBottom: -50, marginTop: -10 }} />
                                <Text style={{ fontSize: 20, textAlign: 'center', fontWeight: 'bold', marginTop: 23, marginLeft: -3 }}>{formatBadgeName(badge.badge_type)}</Text>
                                <Text style={{ fontSize: 8, textAlign: 'center', fontWeight: 'bold', marginTop: 6, color: 'grey' }}> {badgeDetails(badge.badge_type)} </Text>
                                <View style={{ alignSelf: 'center', marginTop: 20, marginBottom: 10 }}>
                                    <Progress.Bar
                                        progress={progressValues[badge.badge_type]}
                                        width={280}
                                        height={8}
                                        color={'#44C662'}
                                    />
                                    <Text style={styles.progressBarText}>
                                        {`Achieved!`}
                                    </Text>
                                </View>
                            </Card>
                        ))}
                    </View>
                }

                {badgeTypes && badgeTypes.length > 0 && user && (
                    <View style={styles.container}>
                        {badgeTypes.map((badgeType, index) => {
                            const formattedBadgeType = badgeType.toUpperCase();
                            return (
                                <Card key={index}>
                                    <Image
                                        source={{
                                            uri: "https://tt02.s3.ap-southeast-1.amazonaws.com/static/badges/" + formattedBadgeType + ".png",
                                        }}
                                        style={{ width: 200, height: 200, marginLeft: 55, marginBottom: -50, marginTop: -10 }}
                                    />
                                    <Text style={{ fontSize: 20, textAlign: 'center', fontWeight: 'bold', marginTop: 23, marginLeft: -3 }}>
                                        {formatBadgeName(formattedBadgeType)}
                                    </Text>
                                    <Text style={{ fontSize: 8, textAlign: 'center', fontWeight: 'bold', marginTop: 6, color: 'grey' }}>
                                        {badgeDetails(formattedBadgeType)}
                                    </Text>
                                    <View style={{ alignSelf: 'center', marginTop: 20, marginBottom: 10 }}>
                                        <Progress.Bar
                                            progress={progressValues[formattedBadgeType]}
                                            width={280}
                                            height={8}
                                            color={'#44C662'}
                                        />
                                        <Text style={styles.progressBarText}>
                                            {`${(progressValues[formattedBadgeType] * 100).toFixed(0)}% Progress`}
                                        </Text>
                                    </View>
                                </Card>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </Background>
    ) :
        (<Text></Text>)
}

const styles = StyleSheet.create({
    emptyContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8
    },
    emptyMessage: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'gray',
        textAlign: 'center'
    },
    progressBarText: {
        position: 'absolute',
        alignSelf: 'center',
        marginTop: 15,
        fontSize: 12,
        color: '#000000',
    },
});