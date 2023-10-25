import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Image } from 'react-native'
import { useIsFocused } from "@react-navigation/native";
import { theme } from '../../core/theme';
import Button from "../../components/Button";
import { storeUser, getUser } from '../../helpers/LocalStorage'
import Toast from "react-native-toast-message";
import moment from 'moment';
import Background from '../../components/Background';
import { Divider } from 'react-native-paper';
import { retrieveBadgesByUserId } from '../../redux/userRedux';

window.Buffer = window.Buffer || require("buffer").Buffer;

export const BadgesScreen = ({ route, navigation }) => {

    const [fetchBadge, setFetchBadge] = useState(false);
    const isFocused = useIsFocused();
    const [user, setUser] = useState();
    const [badges, setBadges] = useState();

    useEffect(() => {
        async function fetchData() {
            const userData = await getUser()
            console.log('gab', userData);
            setUser(userData)
            let badgeResponse = await retrieveBadgesByUserId(userData.user_id);
            if (badgeResponse.status) {
                setBadges(badgeResponse.data);
                console.log('gab2', badgeResponse);
            } else {
                console.log("Badges not shown!");
            }
        }

        if (isFocused || fetchBadge) {
            fetchData();
        }
    }, [isFocused, fetchBadge])

    function formatBadgeName(name) {
        const words = name.split('_');

        const formattedName = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

        return formattedName;
    }

    return user ? (
        <Background>
            <View>
                {badges &&
                    badges.length > 0 && <View style={styles.badgeContainer}>
                        {badges.map((badge, index) => (
                            <View key={index} style={styles.badgeItem}>
                                <Image source={{ uri: badge.badge_icon }} style={{ width: 250, height: 170 }} />
                                <Text style={styles.badgeText}>{formatBadgeName(badge.badge_type)}</Text>
                            </View>
                        ))}
                    </View>}
                {!badges ||
                    badges.length == 0 && <View style={styles.emptyContainer}>
                        <Text style={styles.emptyMessage}>No badges received</Text>
                    </View>
                }

            </View>
        </Background>
    ) :
        (<Text></Text>)
}

const styles = StyleSheet.create({
    badgeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    badgeItem: {
        flexDirection: 'column',
        alignItems: 'center',
        margin: 10,
    },
    badgeText: {
        fontSize: 24,
        textAlign: 'center',
    },
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
});