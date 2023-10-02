import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from '@rneui/themed';

export default function AccommodationRecom({item}) {
    const getColorForType = (label) => {
        const labelColorMap = {
            'HOTEL': 'lightblue',
            'AIRBNB': 'lightgreen',
        };

        return labelColorMap[label] || 'gray';
    };

    return (
        <View style={styles.rCard}>
            <Card>
                <Card.Title style={styles.header}>
                    {item.name}
                </Card.Title>
                <Card.Image
                    style={{ padding: 0, width: 260, height: 100 }}
                    source={{
                        uri: item.accommodation_image_list[0] 
                    }}
                />
                <Text style={{ marginBottom: 15 }}></Text>

                <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.tag, { backgroundColor: getColorForType(item.type) }]}>{item.type}</Text>
                    <Text style={[styles.tag, { backgroundColor: 'purple', color: 'white' }]}>{item.estimated_price_tier}</Text>
                    <Text style={[styles.tag, { backgroundColor: 'green', color: 'white' }]}>{item.generic_location}</Text>
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
    tag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 60,
        fontSize: 7.5,
        fontWeight: 'bold'
    }
});