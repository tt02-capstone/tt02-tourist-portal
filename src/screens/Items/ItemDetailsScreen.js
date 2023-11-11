import Background from "../../components/CardBackground"
import React, { useState, useEffect } from 'react';
import { Button } from 'react-native-paper';
import CartButton from '../../components/Button';
import { Text, Card } from '@rneui/themed';
import { getUser, storeUser } from '../../helpers/LocalStorage';
import { getItemVendor, retrieveItemById , toggleSaveItem, retrieveAllPublishedItemsByVendor , addItemToCart} from '../../redux/itemRedux';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useIsFocused } from "@react-navigation/native";
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'

export const ItemDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [selectedItem, setSelectedItem] = useState([]);
    const [vendors, setVendors]= useState("");
    const isFocused = useIsFocused();
    const [isSaved, setIsSaved] = useState(false);
    const [recommendation , setRecommendation] = useState([]);

    const route = useRoute();
    const { itemId } = route.params;

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        async function fetchData() {
            let response = await retrieveItemById(itemId);
            if (response.status) {
                let item = response.data;
                setSelectedItem(item);

                let vendors = await getItemVendor(itemId); // vendor name 
                setVendors(vendors.data.business_name);

                let vendorId = vendors.data.vendor_id;
                let reccoms = await retrieveAllPublishedItemsByVendor(vendorId);

                if (reccoms.status) {
                    let reccomList = reccoms.data; 
                    let processedReccomList = reccomList.filter(reccom => reccom.item_id !== itemId); // filter out the one thr is nt the current listing 
                    setRecommendation(processedReccomList);

                } else {
                    console.log("no reccommendations");
                }
            } else {
                console.log("Items not available!");
            }
        }

        if (isFocused) {
            fetchUser();
            fetchData();
        }
    }, [isFocused])

    // for save listing 
    useEffect(() => {
        if (user) {
            let saved = false;
            for (var i = 0; i < user.item_list.length; i++) {
                if (user.item_list[i].item_id == itemId) {
                    saved = true;
                    break;
                }
            }
            setIsSaved(saved);
        }
    }, [user])

    // add to saved listing
    const save = async () => {
        let response = await toggleSaveItem(user.user_id, itemId);
        if (response.status) {
            if (!isSaved) {
                setIsSaved(true);
                let obj = {
                    ...user,
                    item_list: response.data
                }
                await storeUser(obj);
                fetchUser();
                Toast.show({
                    type: 'success',
                    text1: 'Listing has been saved!'
                });
            } else {
                setIsSaved(false);
                let obj = {
                    ...user,
                    item_list: response.data
                }
                await storeUser(obj);
                fetchUser();
                Toast.show({
                    type: 'success',
                    text1: 'Listing has been unsaved!'
                });
            }

        } else {
            Toast.show({
                type: 'error',
                text1: response.info
            })
        }
    }

    const [itemQuantity, setItemQuantity] = useState(0);

    const handleIncrease = (prev) => {
        setItemQuantity(prev + 1);
    };

    const handleDecrease = (prev) => {
        if (prev >= 1) {
            setItemQuantity(prev - 1);
        }
    };

    const viewOtherItem = (item_id) => {
        navigation.push('ItemDetailsScreen', { itemId: item_id });
    }

    const addToCart = async () => {
        let dateNow = new Date();
        console.log(dateNow)

        if (itemQuantity < 1) {
            Toast.show({
                type: 'error',
                text1: "Please at least add quantity of 1!"
            })
        } else if (selectedItem.quantity < itemQuantity) {
            Toast.show({
                type: 'error',
                text1: "Insufficient Stocks!"
            })
        } else {
            let cartBooking = {
                activity_name: selectedItem.name,
                start_datetime: dateNow,
                end_datetime: dateNow,
                type: 'ITEM',
                cart_item_list: [ // cart item
                    {
                        start_datetime: dateNow,
                        end_datetime: dateNow,
                        quantity: itemQuantity,
                        price: selectedItem.price,
                        activity_selection: selectedItem.name,
                        type: 'ITEM'
                    }
                ],
            };

            let response = await addItemToCart(user.user_id, selectedItem.item_id, cartBooking);
            if (response.status) {
                setItemQuantity(0);
                Toast.show({
                    type: 'success',
                    text1: 'Item has been added to cart!'
                });
            } else {
                console.log("Item was not added to cart!");
                console.log(response.data);
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage,
                });
            }
        }
    }

    return (
        <Background>
            <ScrollView>
                { selectedItem && user && 
                    <>
                    <View style={styles.container}>
                        <Card>
                            { selectedItem.is_limited_edition && (
                                <Text style={{color:'red', fontSize:10, fontWeight:'bold', marginTop:5, marginBottom: 15, marginLeft:8}}> LIMITED EDITION </Text>
                            )}
                            <Image source={{ uri: selectedItem.image }} style={{ width: 300, height: 300, marginLeft:8, marginBottom: 12 }} />
                        
                            <View style={{marginLeft: 10, marginTop:0}}>
                                { vendors != undefined && (
                                    <View>
                                        <Text style={{ fontSize: 10, marginLeft:0, marginBottom: 5, fontWeight:'bold', color:'grey'}}> sold by</Text>
                                        <View style={{flexDirection: 'row', marginLeft:3}}>
                                            <Icon name="shopping-basket" size={13} color='#044537'/>
                                            <Text style={{ fontSize: 13, marginLeft:-2, marginBottom:20, fontWeight:'bold', color:'#044537'}}>  {vendors} </Text>
                                        </View>
                                    </View>
                                )}

                                <View style={{flexDirection:"row"}}>
                                    <Text style={{ fontSize: 15 , fontWeight:'bold', marginTop:0, color:'#044537'}}> {selectedItem.name}  </Text>
                                        <Button mode="text" style={{ marginTop:-10, marginLeft:-20 , width:'10%'}} onPress={save} >
                                            {isSaved && <Icon name="heart" size={15} color='red' />}
                                            {!isSaved && <Icon name="heart" size={15} color='grey' />}
                                        </Button>
                                </View>

                                <Text style={{ fontSize: 13 ,  marginTop:0, color:'grey', width:300}}> {selectedItem.description} </Text>
                                <Text style={{ fontSize: 15 , fontWeight:'bold', marginTop:13, color:'black'}}> $ {selectedItem.price}.00 </Text>
                            
                            </View>

                            <View key={itemQuantity} style={{ flexDirection: 'row', alignItems: 'center', width: 600, marginLeft: 0, marginBottom: 30, marginTop:30 }}>
                                <Button mode="contained" style={{ backgroundColor: '#044537', color: "white", marginLeft: 10, width:'20%' }} onPress={() => handleDecrease(itemQuantity)}>-</Button>
                                <Text style={{ fontSize: 18, marginLeft: 22, fontWeight:'bold' }}>{itemQuantity ? itemQuantity : 0}</Text>
                                <Button mode="contained" style={{ backgroundColor: '#044537', color: "white", marginLeft: 30, width:'20%' }} onPress={() => handleIncrease(itemQuantity)}>+</Button>
                            </View>

                            <View style={styles.cartOut}>
                                <CartButton
                                    style={styles.cartButton}
                                    text="Add to Cart"
                                    mode="contained"
                                    onPress={addToCart}
                                />
                            </View>
                            
                        </Card>
                    </View>

                    {/* reccommedation from the same shop */}
                    <View>
                        {recommendation.length > 0 && (
                            <Card containerStyle={styles.dropBorder}>
                                <Card.Title style={styles.header}>
                                    From The Same Shop 
                                </Card.Title>

                                <ScrollView horizontal>
                                    <View style={{ flexDirection: 'row', height: 350, }}>
                                        {
                                            recommendation.map((item, index) => (
                                                <TouchableOpacity key={index} onPress={() => viewOtherItem(item.item_id)}>
                                                    <Card key={index} >
                                                        <Image source={{ uri: item.image }} style={{ width: 200, height: 150, marginLeft:0 }} /> 
                                                        <View>
                                                            <View style={{marginLeft: 10, marginTop:3}}>
                                                            
                                                                {/* { item.quantity <=5 && (
                                                                    <Text style={{color:'red', fontSize:10, fontWeight:'bold', marginBottom:3, marginLeft:2}}> SELLING OUT SOON </Text>
                                                                )} */}

                                                                <Text style={{ fontSize: 15 , fontWeight:'bold', marginTop:5, marginLeft:-10, color:'#044537'}}> {item.name} </Text>
                                                                <Text style={{ fontSize: 11 , fontWeight:'bold', marginTop:3, color:'black', marginLeft:-10,}}> $ {item.price}.00 </Text>
                                                            
                                                            </View>
                                                        </View>
                                                    </Card>
                                                </TouchableOpacity>
                                            ))
                                        }
                                    </View>
                                </ScrollView>
                            </Card>
                        )}
                    </View>
                   </>
                }
            </ScrollView>
        </Background>
    )
}

const styles = StyleSheet.create({
    container : {
        flex : 1
    },
    cartOut: {
        width: 330,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartButton: {
        marginTop: 3,
        width: '96%',
        alignSelf: 'center',
    },
    dropBorder: {
        borderWidth: 0,
        shadowColor: 'rgba(0,0,0, 0.0)',
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        backgroundColor: theme.colors.surface,
    },
    header: {
        textAlign: 'left',
        fontSize: 13,
        color: '#044537',
        flexDirection: 'row'
    },
});

export default ItemDetailsScreen