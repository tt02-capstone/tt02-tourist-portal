import React , { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import { Button } from 'react-native-paper';
import { theme } from '../../core/theme'
import { getUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import { Text, Card } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getRestaurantById, saveRestaurantForUser , getRestaurantDish } from '../../redux/restaurantRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { useIsFocused } from "@react-navigation/native";

const RestaurantDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [restaurant, setRestaurant] = useState([]);
    const [dishList, setDishList] = useState([]);
    const [imgList, setImgList] = useState([]);
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();
    const route = useRoute();
    const { restId } = route.params;

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    const getRestaurant = async () => {        
        let response = await getRestaurantById(restId);
        if (response.status) {
            setRestaurant(response.data);
            setImgList(response.data.restaurant_image_list);

            let dishes = await getRestaurantDish(restId)

            if (dishes.status && dishes.data.length != 0) {
                const groupedDishes = dishes.data.reduce((acc, dish) => {
                    const type = dish.dish_type;
                
                    if (!acc[type]) {
                        acc[type] = [];
                    }
                
                    acc[type].push(dish);
                    return acc;
                }, {});
    
                setDishList(groupedDishes);
            } 

        } else {
            console.log("Restaurant not fetched!");
        }
        setLoading(false);
    }

    const showDishList = Object.keys(dishList).map(type => (
        <Card key={type}>
            <View style={{ width: 305 }}>
                <Text style={styles.header}>{type}</Text>
                {dishList[type].map(dish => (
                    <View key={dish.dish_id} style={{ flexDirection: 'row', alignItems: 'center'}}>
                        <View style={{ marginTop:10, width:220,flexDirection: 'row'}}>
                            <Text style={{fontSize:12}}>{dish.name}</Text>
                            
                            {/* buffer space */}
                            <Text> </Text> 

                            {dish.spicy && <Text style={{ fontSize: 8, color: 'red' , fontWeight:'bold', marginTop:2}}> 
                            <Icon name="fire" size={10} />
                            </Text>}
                            
                            {/* buffer space */}
                            <Text> </Text> 
                            
                            {dish.is_signature && <Text style={{ fontSize: 8, color: 'blue' , fontWeight:'bold', marginTop:2}}> 
                            <Icon name="thumbs-up" size={10} color='#044537'/>
                            </Text>}
                        </View>
                        <Text style={{marginLeft: 50, marginTop:10, fontSize:12, fontWeight:'bold'}}> $ {dish.price}</Text>
                    </View>
                ))}
            </View>
        </Card>
    ));

    useEffect(() => {
        if (isFocused) {
            setLoading(true);
            fetchUser();
            getRestaurant();
        }
    }, [isFocused]);

    const getColorForType = (label) => {
        const labelColorMap = {
          'KOREAN': 'lightblue',
          'MEXICAN': 'lightgreen',
          'CHINESE': 'orange',
          'WESTERN' : 'yellow',
          'FAST_FOOD' : 'turquoise',
          'JAPANESE' : 'lightpink'
        };

        return labelColorMap[label] || 'gray';
    };

    const saveRest = async () => {
        let response = await saveRestaurantForUser(user.user_id, restaurant.restaurant_id);
        if (response.status) {
            fetchUser();
            Toast.show({
                type: 'success',
                text1: 'Restaurant has been saved!'
            });

        } else {
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }

    return (
        <Background>
                <ScrollView>
                    <Card>
                        <Card.Image
                            style={{ padding: 0, width: 350, height: 350}}
                            source={{
                                uri: imgList[0] // KIV for image make it carousel if possible 
                            }}
                        />

                        <Card.Title style={styles.header}>
                            {restaurant.name} 
                            <Button mode="text" style={{ marginTop: -13}} onPress={saveRest} >
                                <Icon name="heart" size={15} color='blue'/>
                            </Button>
                        </Card.Title>
                        
                        <Text style={[styles.subtitle]}>{restaurant.address}</Text>
                        <Text style={styles.subtitle}>Operating Hours: {restaurant.opening_hours}</Text>
                        <Text style={styles.description}>{restaurant.description}</Text>
                        <Text style={[styles.tag, {backgroundColor:'purple', color: 'white'}]}>{restaurant.estimated_price_tier}</Text>

                    </Card>
                    
                    <Card containerStyle={styles.dropBorder}>
                        <Card.Title style={styles.header}>
                            Menu
                        </Card.Title>

                        <View style={{ justifyContent: 'center', flex: 1, alignItems: 'left', marginLeft: -15, marginTop: -11}}>
                            { showDishList }
                        </View>

                    </Card>
            
                    <Card containerStyle={styles.dropBorder}>
                        <Card.Title style={styles.header}>
                            Nearby Recommendation
                        </Card.Title>

                        {/* to be continued */}
                    </Card>
                </ScrollView>
            </Background>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1
    },
    rCard:{
        flex:1,
        width: 320,
        height: 100,
        borderRadius: 4,
        margin: 2
    },
    header:{
        textAlign: 'left',
        fontSize: 13,
        color: '#044537',
        flexDirection: 'row',
        fontWeight: 'bold'
    },
    image: {
        width: 30,height: 30,marginRight: 10,
    },
    name: {
        fontSize: 16,marginTop: 5,
    },
    subtitle: {
        marginBottom: 5, fontSize: 12, color: 'grey'
    },
    description: {
        marginBottom: 10, fontSize: 12, marginTop : 10 
    },
    recommendation:{
        marginBottom: 10, textAlign: 'center', marginTop : 10 
    },
    tag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 80,
        fontSize: 11,
        fontWeight: 'bold'
    },
    dropBorder: {
        borderWidth: 0, 
        shadowColor: 'rgba(0,0,0, 0.0)',
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        backgroundColor: theme.colors.surface,
    }
    
});

export default RestaurantDetailsScreen