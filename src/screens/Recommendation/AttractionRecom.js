import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from '@rneui/themed';

export default function AttractionRecom({item}) {
    
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
                <Card.Image
                    style={{ padding: 0, width: 260, height: 100 }}
                    source={{
                        uri: item.attraction_image_list[0] 
                    }}
                />
                <Text style={{ marginBottom: 15 }}></Text>

                <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.tag, { backgroundColor: getColorForType(item.attraction_category) }]}>{item.attraction_category}</Text>
                    <Text style={[styles.tag, { backgroundColor: 'purple', color: 'white' }]}>{item.estimated_price_tier}</Text>
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
        width: 90,
        fontSize: 7.5,
        fontWeight: 'bold'
    }
});