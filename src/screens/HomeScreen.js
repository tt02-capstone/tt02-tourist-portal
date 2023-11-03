import React, { useContext, useEffect, useState } from 'react'
import Background from '../components/CardBackground'
import Button from '../components/Button'
import {View, ScrollView, StyleSheet, Image, TouchableOpacity, Modal} from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { clearStorage, getUser, getUserType } from '../helpers/LocalStorage';
import { Paragraph } from "react-native-paper";
import { localApi, loggedUserApi, touristApi } from "../helpers/api";
import { AuthContext } from "../helpers/AuthContext";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import {getPublishedTelecomList} from "../redux/telecomRedux";
import {getRecommendationFromBookings} from "../redux/recommendationRedux";
import RNPickerSelect from "react-native-picker-select";
import {getPaymentHistoryList} from "../redux/reduxBooking";
import {useIsFocused} from "@react-navigation/native";

export const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState('')
  const authContext = useContext(AuthContext);
  const [recommendedList, setRecommendedList] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [categoryTypeFilter, setCategoryTypeFilter] = useState(null);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [originalCombinedList, setOriginalCombinedList] = useState([]);
  const isFocused = useIsFocused();

  function shuffleArray(array) {
    // Create a copy of the original array to avoid modifying the original array.
    const shuffledArray = [...array];

    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      // Swap elements at i and j.
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    return shuffledArray;
  }


  useEffect(() => {
    async function onLoad() {
      try {
        const userData = await getUser();
        setUserData(userData);
        const userId = userData.user_id;

        let response = await getRecommendationFromBookings(userId);
        // console.log(response)
        if (response.status) {
          let combinedList = [
            ...response.data.accommodationList,
            ...response.data.attractionList,
            ...response.data.restaurantList,
            ...response.data.telecomList,
            ...response.data.tourTypeList,
          ];
          // console.log(combinedList)
          combinedList = shuffleArray(combinedList)
          setOriginalList(response.data)
          setOriginalCombinedList(combinedList)
          setRecommendedList(combinedList);
        } else {
          console.log("Recommendation list not fetch!");
        }
      } catch (error) {
        alert('An error occur! Failed to retrieve recommendation list!' );
        console.log(error)
      }
    }
    onLoad();

    if (isFocused) {
      onLoad();
    }
  }, [isFocused]);

  // useEffect( () => {
  //   console.log("HomeScreen userId", userData);
  //
  //   if(userData) {
  //     const fetchData = async () => {
  //       const userId = userData.user_id;
  //       console.log("HomeScreen userId", userId);
  //       let response = await getRecommendationFromBookings(9);
  //       console.log(response)
  //       if (response.status) {
  //         let combinedList = [
  //           ...response.data.accommodationList,
  //           ...response.data.attractionList,
  //           ...response.data.restaurantList,
  //           ...response.data.telecomList,
  //           ...response.data.tourTypeList,
  //         ];
  //         console.log(combinedList)
  //         combinedList = shuffleArray(combinedList)
  //         setOriginalList(response.data)
  //         setOriginalCombinedList(combinedList)
  //         setRecommendedList(combinedList);
  //       } else {
  //         console.log("Recommendation list not fetch!");
  //       }
  //     };
  //     fetchData()
  //   }
  //
  //   fetchUser();
  //
  // }, []);

  async function fetchUser() {
    const userData = await getUser()
    setUserData(userData)
    const usertype = await getUserType()
  }

  const toggleFilterModal = () => {
    setFilterModalVisible(!isFilterModalVisible);
  };

  const getColorForTypeAttraction = (label) => {
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

  const onLogoutPressed = async () => {
    await clearStorage();
    await authContext.logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    })
  }

  const viewAttractionDetails = (attraction_id) => {
    navigation.navigate('AttractionDetailsScreen', { attractionId: attraction_id }); // set the attraction id here
  }

  const viewTelecomDetails = (id) => {
    navigation.navigate('TelecomDetailsScreen', { id: id }); // set the attraction id here
  }


  const clearFilters = () => {
    setSelectedFilters([]);
    setCategoryTypeFilter(null)
    setTimeout(() => {
      setRecommendedList(originalCombinedList);
    }, 10);
  };

  const viewTourDetails = (item) => {
    navigation.navigate('TourDetailsScreen', { item });
  }

  const getColorForTypeAccommodation = (label) => {
    const labelColorMap = {
      'HOTEL': 'lightblue',
      'AIRBNB': 'lightgreen',
    };

    return labelColorMap[label] || 'gray';
  };

  const viewAccommodationDetails = (accommodation_id) => {
    navigation.navigate('AccommodationDetailsScreen', { accommodationId: accommodation_id }); // set the accommodation id here
  }


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

  // Function to handle filter selection
  const handleFilterSelect = (filterType, filterValue) => {
    const newSelectedFilters = [...selectedFilters];
    const filterIndex = newSelectedFilters.findIndex(filter => filter.type === filterType);

    if (filterIndex !== -1) {
      // If the filter type already exists, update the value
      newSelectedFilters[filterIndex].value = filterValue;
    } else {
      // If the filter type does not exist, add a new filter
      newSelectedFilters.push({ type: filterType, value: filterValue });
    }

    setSelectedFilters(newSelectedFilters);

    // Update individual filter states
    switch (filterType) {
      case 'CategoryType':
        setCategoryTypeFilter(filterValue);
        break;
      default:
        break;
    }
  };

  const viewAttractions = () => {
    navigation.navigate('AttractionScreen')
  }

  const viewAccommodations = () => {
    navigation.navigate('AccommodationScreen')
  }

  const viewRestaurant = () => {
    navigation.navigate('RestaurantScreen')
  }

  const viewTelecoms = () => {
    navigation.navigate('TelecomScreen')
  }

  const viewDeals = () => {
    navigation.navigate('DealScreen')
  }

  const SearchByCategory = () => {
    return <>
      <View style={styles.container}>
        <Card>
          <Card.Title>Attractions</Card.Title>
          <Card.Image
              style={{ padding: 0 }}
              source={{
                uri: 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/attractions.jpg'
              }}
          />
          <Text style={styles.description}>
            Embark on an exciting journey in Singapore and explore a diverse array of attractions that cater to every interest
            from iconic landmarks to hidden gems!
          </Text>
          <Button style={styles.button} text="VIEW MORE" mode="contained" onPress={viewAttractions} />
        </Card>

        <Card>
          <Card.Title>Accomodation</Card.Title>
          <Card.Image
              style={{ padding: 0 }}
              source={{
                uri: 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/accoms.jpg'
              }}
          />
          <Text style={styles.description}>
            Discover a wide range of accommodation options in Singapore, tailored to suit every traveler's preferences.
            Start exploring your options now!
          </Text>
          <Button style={styles.button} text="VIEW MORE" mode="contained" onPress={viewAccommodations} />
        </Card>

        <Card>
          <Card.Title>Restaurant</Card.Title>
          <Card.Image
              style={{ padding: 0 }}
              source={{
                uri: 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/restaurant.jpg'
              }}
          />
          <Text style={styles.description}>
            Indulge your taste buds in Singapore's vibrant culinary scene, where a myriad of restaurants await to
            delight your palate. Come and savor the extraordinary culinary delights that await you!
          </Text>
          <Button style={styles.button} text="VIEW MORE" mode="contained" onPress={viewRestaurant} />
        </Card>

        <Card>
          <Card.Title>Telecom Packages</Card.Title>
          <Card.Image
              style={{ padding: 0 }}
              source={{
                uri: 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/telecom.png'
              }}
          />
          <Text style={styles.description}>
            Stay connected during your Singapore adventure with tailored telecom packages designed especially for tourists.
            Choose from a variety of cost-effective plans and make the most of your visit with our telecom packages!
          </Text>
          <Button style={styles.button} text="VIEW MORE" mode="contained" onPress={viewTelecoms} />
        </Card>

        <Card>
          <Card.Title>Deals and Discount</Card.Title>
          <Card.Image
              style={{ padding: 10 }}
              source={{
                uri: 'http://tt02.s3-ap-southeast-1.amazonaws.com/static/mobile/discount.png'
              }}
          />
          <Text style={styles.description}>
            Unlock unbeatable deals and discounts that add extra value to your Singapore journey. Don't miss out
            on the chance to save while indulging in the best Singapore can offer!
          </Text>
          <Button style={styles.button} text="VIEW MORE" mode="contained" onPress={viewDeals} />
        </Card>
      </View>
    </>
  }

  const applyFilters = () => {
    let filteredList = [];

    for (const filter of selectedFilters) {
      console.log(filter.type, filter.value)
      switch (filter.type) {
        case 'CategoryType': {
          switch (filter.value) {
            case 'attractionCategory':
              filteredList = originalList.attractionList;
              break;
            case 'accommodationCategory':
              filteredList = originalList.accommodationList;
              break;
            case 'restaurantCategory':
              filteredList = originalList.restaurantList;
              break;
            case 'telecomCategory':
              filteredList = originalList.telecomList;
              break;
            case 'tourCategory':
              filteredList = originalList.tourTypeList;
              break;
          }
        }
        default:
          break;
      }
    }

    setRecommendedList(filteredList);
    toggleFilterModal();
  };
  return (
    <Background>
      <ScrollView>
        {recommendedList.length > 0? (
            <>
                <View style={styles.textcontainer}>
                  <Text style={styles.header}>
                    Recommendations to get you started on your next adventure
                  </Text>
                </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={toggleFilterModal} style={styles.filterButton}>
                <Text style={styles.filterText}>Filter</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={clearFilters} style={styles.filterButton}>
                <Text style={styles.filterText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
            </>
        ): (
            <>
              <View style={styles.textcontainer}>
                <Text style={styles.header}>
                  Welcome back! Explore a range of Attractions, Accommodations and more below
                </Text>
              </View>
              {SearchByCategory()}
            </>
        )}

        <View style={styles.container}>
          {recommendedList && recommendedList.map((item, index) => {
            if (item.listing_type && item.listing_type === 'ATTRACTION') {
              return ( // Add the 'return' statement here
                  <TouchableOpacity key={index} onPress={() => viewAttractionDetails(item.attraction_id)}>
                    <Card>
                      <Card.Title style={styles.telecomheader}>
                        {item.name}
                      </Card.Title>
                      <Card.Image
                          style={{padding: 0}}
                          source={{
                            uri: item.attraction_image_list[0] // KIV for image
                          }}
                      />

                      <Text style={styles.description}>{item.description}</Text>

                      <View style={styles.tagContainer}>
                        <Text
                            style={[
                              styles.typeTag,
                              {backgroundColor: getColorForTypeAttraction(item.attraction_category)},
                              {textAlign: 'center'},
                            ]}
                        >
                          {item.attraction_category}
                        </Text>
                        <Text
                            style={[
                              styles.tierTag,
                              {backgroundColor: 'purple', color: 'white'},
                              {textAlign: 'center'},
                            ]}
                        >
                          {item.estimated_price_tier.replace(/_/g, ' ')}
                        </Text>
                        <Text
                            style={[
                              styles.locationTag,
                              {backgroundColor: 'green', color: 'white', textAlign: 'center'},
                            ]}
                        >
                          {item.generic_location.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
              );
            }

            if (item.data_limit_category) {
              return (
                  <TouchableOpacity key={index} onPress={() => viewTelecomDetails(item.telecom_id)}>
                    <Card>
                      <Card.Title style={styles.telecomheader}>
                        {item.name}
                      </Card.Title>
                      <Card.Image
                          style={{ padding: 0, height: 200 }}
                          source={{
                            uri: item.image
                          }}
                      />

                      <Text style={styles.description}>
                        <Text style={{ fontWeight: 'bold' }}>Price: </Text><Text>${item.price}     </Text>
                        <Text style={{ fontWeight: 'bold' }}>Duration: </Text><Text>{item.num_of_days_valid} day(s)    </Text>
                        <Text style={{ fontWeight: 'bold' }}>Data Limit: </Text><Text>{item.data_limit}GB</Text>
                      </Text>
                      <Text style={styles.description}>{item.description}</Text>
                      <View style={styles.tagContainer}>
                        <Text style={[styles.tag, { backgroundColor: 'purple', color: 'white', textAlign: 'center' }]}>{formatEstimatedPriceTier(item.estimated_price_tier)}</Text>
                        <Text style={[styles.tag, { backgroundColor: 'royalblue', color: 'white', textAlign: 'center' }]}>{formatDurationCategory(item.plan_duration_category)}</Text>
                        <Text style={[styles.tag, { backgroundColor: 'green', color: 'white', textAlign: 'center' }]}>{formatDataLimitCategory(item.data_limit_category)}</Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
              )}

            if(item.accommodation_id) {
              return (
                  <TouchableOpacity
                      key={index}
                      onPress={() => viewAccommodationDetails(item.accommodation_id)}
                      style={styles.card}
                  >
                    <Card>
                      <Card.Title style={styles.cardTitle}>{item.name}</Card.Title>
                      <Card.Image
                          style={styles.cardImage}
                          source={{
                            uri: item.accommodation_image_list[0],
                          }}
                      />
                      <Text style={styles.cardDescription}>{item.description}</Text>
                      <View style={styles.tagContainer}>
                        <Text
                            style={[
                              styles.tag,
                              { backgroundColor: getColorForTypeAccommodation(item.type) },
                              { textAlign: 'center' },
                            ]}
                        >
                          {item.type}
                        </Text>
                        <Text
                            style={[
                              styles.tag,
                              { backgroundColor: 'purple', color: 'white' },
                              { textAlign: 'center' },
                            ]}
                        >
                          {item.estimated_price_tier.replace(/_/g, ' ')}
                        </Text>
                        <Text
                            style={[
                              styles.locationTag,
                              { backgroundColor: 'green', color: 'white', textAlign: 'center' },
                            ]}
                        >
                          {item.generic_location.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
              )
            }

            if(item.tour_type_id) {
              return (<TouchableOpacity key={index}>
                <Card>
                  <Card.Title style={styles.cardTitle}>
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
                  <Button style={styles.button} text="View Details" mode="contained" onPress={() => viewTourDetails(item)} />
                </Card>
              </TouchableOpacity>)
            }
          })}

          <Modal
              animationType="slide"
              transparent={true}
              visible={isFilterModalVisible}
              onRequestClose={toggleFilterModal}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <ScrollView>
                  {/* Filter options go here */}
                  <View style={styles.filterBox}>
                    {/* Attraction Category Filter */}
                    <RNPickerSelect
                        placeholder={{
                          label: 'Select Category Type',
                          value: null,
                        }}
                        onValueChange={(value) =>
                            handleFilterSelect('CategoryType', value)
                        }
                        items={[
                          { label: 'Telecom Category', value: 'telecomCategory' },
                          { label: 'Attraction Category', value: 'attractionCategory' },
                          { label: 'Tour Category', value: 'tourCategory' },
                          { label: 'Accommodation Category', value: 'accommodationCategory' },
                          { label: 'Restaurant Category', value: 'restaurantCategory' },
                        ]}
                        value={categoryTypeFilter}
                        style={pickerSelectStyles}
                    />
                  </View>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={applyFilters} style={[styles.filterButton, { marginRight: 5 }]}>
                      <Text style={styles.filterText}>Apply</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleFilterModal} style={styles.filterButton}>
                      <Text style={styles.filterText}>Close</Text>
                    </TouchableOpacity>
                  </View>

                </ScrollView>
              </View>
            </View>
          </Modal>



          <Button
            style={styles.button}
            text="Logout"
            mode="contained"
            onPress={onLogoutPressed}
          />
        </View>
      </ScrollView>
    </Background>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textcontainer: {
    flex: 1,
    backgroundColor: '#3498DB', // A blue background color
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Add padding to the container
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
    fontSize: 7.5,
    fontWeight: 'bold'
  },
  header: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    margin: 12,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',

  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterBox: {
    flex: 1,
    margin: 8,
  },
  filterButton: {
    backgroundColor: '#eb8810',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginLeft: 10,
    alignItems: 'center',
    alignSelf: 'center',
    width: '30%',
  },
  filterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
  },
  cardImage: {
    padding: 0,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 13,
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
  },
  typeTag: {
    color: 'black',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    margin: 5,
    width: 85,
    fontSize: 7,
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 10,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  button: {
    width: '70%',
    alignSelf: 'center',
  },
  telecomheader: {
    color: '#044537',
    fontSize: 15
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    marginBottom: 5,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
});