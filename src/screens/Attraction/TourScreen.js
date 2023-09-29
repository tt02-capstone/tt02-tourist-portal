import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from '@rneui/themed';

const TourScreen = ({ route, navigation }) => {
  const { tours } = route.params;

  const viewTour = (item) => {
    navigation.navigate('TourDetailsScreen', { item });
  }

  return (
    <Background>
      <ScrollView>
        <View style={styles.container}>
          {
            tours.map((item, index) => (
              <TouchableOpacity key={index}>
                <Card>
                  <Card.Title style={styles.header}>
                    {item.name}
                  </Card.Title>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'start',
                    padding: 16,
                  }}>
                    {/* Text on the left */}
                    <Text style={styles.description}>
                      Price: S${item.price} {'\n'} {'\n'}
                      Est. Duration: {item.estimated_duration} Hours {'\n'} {'\n'}
                      Recommended Pax: {item.recommended_pax}
                    </Text>
                    {/* Image on the right */}
                    <Card.Image
                      style={{
                        width: 120,
                        height: 120,
                        marginLeft: 40,
                      }}
                      source={{
                        uri: item.tour_image_list[0]
                      }}
                    />
                  </View>
                  <Button style={styles.button} text="View Details" mode="contained" onPress={() => viewTour(item)} />
                </Card>
              </TouchableOpacity>
            ))
          }
        </View>
      </ScrollView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fonts: {
    marginBottom: 8,
  },
  user: {
    flexDirection: 'row', marginBottom: 6,
  },
  image: {
    width: 30, height: 30, marginRight: 10,
  },
  name: {
    fontSize: 16, marginTop: 5,
  },
  description: {
    marginBottom: 20, fontSize: 13, marginTop: 10
  },
  tag: {
    color: 'black',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    margin: 5,
    width: 90,
    fontSize: 11,
    fontWeight: 'bold'
  },
  header: {
    color: '#044537',
    fontSize: 15
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
  button: {
    width: '100%'
  }
});

export default TourScreen;  