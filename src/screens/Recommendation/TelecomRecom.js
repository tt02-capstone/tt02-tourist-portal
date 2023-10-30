import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from '@rneui/themed';

export default function TelecomRecom({ item }) {
    const getColorForType = (label) => {
        const labelColorMap = {
            'HOTEL': 'lightblue',
            'AIRBNB': 'lightgreen',
        };

        return labelColorMap[label] || 'gray';
    };

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
            return '1 DAY';
        } else if (text === 'THREE_DAY') {
            return '3 DAYS';
        } else if (text === 'SEVEN_DAY') {
            return '7 DAYS';
        } else if (text === 'FOURTEEN_DAY') {
            return '14 DAYS';
        } else if (text === 'MORE_THAN_FOURTEEN_DAYS') {
            return '> 14 DAYS';
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
        <View style={styles.rCard}>
            <Card>
                <Card.Title style={styles.header}>
                    {item.name}
                </Card.Title>
                <Card.Image
                    style={{ padding: 0, width: 260, height: 120, resizeMode: 'cover', }}
                    source={{
                        uri: item.image
                    }}
                />
                <Text style={{ marginBottom: 5 }}></Text>

                <View style={styles.tagContainer}>
                <Text style={[styles.tag, { backgroundColor: 'purple', color: 'white', textAlign: 'center' }]}>{formatEstimatedPriceTier(item.estimated_price_tier)}</Text>
                                    <Text style={[styles.tag, { backgroundColor: 'royalblue', color: 'white', textAlign: 'center' }]}>{formatDurationCategory(item.plan_duration_category)}</Text>
                                    <Text style={[styles.tag, { backgroundColor: 'green', color: 'white', textAlign: 'center' }]}>{formatDataLimitCategory(item.data_limit_category)}</Text>
                </View>

            </Card>

            <Text style={{ marginBottom: 15 }}></Text>
        </View>
    );
}

const styles = StyleSheet.create({
    rCard: {
        flex: 1,
        width: 320,
        height: 100,
        borderRadius: 4,
        margin: 2
    },
    header: {
        textAlign: 'left',
        fontSize: 13,
        color: '#044537',
        flexDirection: 'row'
    },
    name: {
        fontSize: 16, marginTop: 5,
    },
    tagContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    tag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 60,
        fontSize: 9,
        fontWeight: 'bold'
    },
    locationTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 100,
        fontSize: 9,
        fontWeight: 'bold',
    },
    tierTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 50,
        fontSize: 8,
        fontWeight: 'bold',
    },
});