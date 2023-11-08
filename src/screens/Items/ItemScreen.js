import Background from "../../components/CardBackground"
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { Text, Card } from '@rneui/themed';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { retrieveAllPublishedItems, getItemVendor } from '../../redux/itemRedux';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import { useIsFocused } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/FontAwesome';

export const ItemScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [itemList, setItemList] = useState([]);
    const [vendors, setVendors]= useState([]);
    const isFocused = useIsFocused();

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        async function fetchData() {
            let response = await retrieveAllPublishedItems();
            if (response.status) {
                setItemList(response.data);
                const vendors = await Promise.all(response.data.map(item => getItemVendor(item.item_id)));
                setVendors(vendors);
            } else {
                console.log("Items not available!");
            }
        }

        if (isFocused) {
            fetchUser();
            fetchData();
        }
    }, [isFocused])

    return (
        <Background>
            <ScrollView>
                {itemList && itemList.length > 0 && user && 
                <View style={styles.container}>
                    {itemList.map((item, index) => (
                        <Card key={index} style={{ width: 500, height:500}}>
                            <View style={{flexDirection: 'row'}}>
                                <Image source={{ uri: item.image }} style={{ width: 100, height: 100, marginLeft:0 }} />
                                <View style={{marginLeft: 10, marginTop:10}}>
                                    
                                    {vendors.length > 0 && (
                                        <View style={{flexDirection: 'row', marginLeft:3}}>
                                            <Icon name="shopping-basket" size={10} color='#044537'/>
                                            <Text style={{ fontSize: 10, marginLeft:-2, fontWeight:'bold', color:'#044537'}}>  {vendors[index].data.business_name} </Text>
                                        </View>
                                    )}
                                    
                                    { item.is_limited_edition && (
                                        <Text style={{color:'red', fontSize:10, fontWeight:'bold', marginTop:5}}> LIMITED EDTION </Text>
                                    )}

                                    { item.quantity <=5 && (
                                        <Text style={{color:'red', fontSize:10, fontWeight:'bold', marginTop:5}}> SELLING OUT SOON </Text>
                                    )}

                                    <Text style={{ fontSize: 15 , fontWeight:'bold', marginTop:3, color:'#044537'}}> {item.name} </Text>
                                    <Text style={{ fontSize: 12 , fontWeight:'bold', marginTop:6, color:'grey'}}> {item.description} </Text>
                                    <Text style={{ fontSize: 12 , fontWeight:'bold', marginTop:6, color:'grey'}}> $ {item.price}.00 </Text>
                                   
                                </View>
                            </View>
                        </Card>
                    ))}
                </View>
                }
            </ScrollView>
        </Background>
    )
}

const styles = StyleSheet.create({
    container : {
        flex : 1
    },
});

export default ItemScreen