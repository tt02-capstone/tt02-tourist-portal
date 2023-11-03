import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from '@rneui/themed';

export default function ForumAttractionRecom({item}) {
    
    const getColorForType = (label) => {
        const labelColorMap = {
            'HISTORICAL': 'lightblue',
            'CULTURAL': 'lightgreen',
            'NATURE': 'orange',
            'ADVENTURE': 'yellow',
            'SHOPPING': 'turquoise',
            'ENTERTAINMENT': 'lightpink'
        };

        return labelColorMap[label] || 'gray';
    };

    return (
        <View style={styles.rCard}>
            <Card>
                <Card.Title style={styles.header}>
                    {item.name}
                </Card.Title>
                {/* <Card.Image
                    style={{ padding: 0, width: 260, height: 120, resizeMode: 'cover', }}
                    source={{
                        uri: item.attraction_image_list[0] 
                    }}
                /> */}
                <Text style={{ marginBottom: -20 }}></Text>

                <View style={styles.tagContainer}>
                    <Text style={[styles.typeTag, { backgroundColor: getColorForType(item.attraction_category), textAlign: 'center' }]}>{item.attraction_category}</Text>
                    <Text style={[styles.tierTag, { backgroundColor: 'purple', color: 'white', textAlign: 'center' }]}>{item.estimated_price_tier ? item.estimated_price_tier.replace(/_/g, ' ') : ''}</Text>
                    <Text style={[styles.locationTag, { backgroundColor: 'green', color: 'white', textAlign: 'center' }]}>{item.generic_location ? item.generic_location.replace(/_/g, ' ') : ''}</Text>
                </View>
            </Card>

            <Text style={{ marginBottom: 15 }}></Text>
        </View>
    );
}

const styles = StyleSheet.create({
    rCard: {
        flex: 1,
        width: 290,
        height: 100,
        borderRadius: 4,
        margin: 2
    },
    header: {
        textAlign: 'left',
        fontSize: 12,
        color: '#044537',
        flexDirection: 'row'
    },
    name: {
        fontSize: 16, marginTop: 5,
    },
    tagContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: -20,
    },
    typeTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 80,
        fontSize: 6.5,
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
    locationTag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 80,
        fontSize: 8,
        fontWeight: 'bold',
    },
});