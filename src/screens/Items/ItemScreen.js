import Background from "../../components/CardBackground"
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { Text, Card } from '@rneui/themed';
import { getUser } from '../../helpers/LocalStorage';
import { retrieveAllPublishedItems, getItemVendor, toggleSaveItem } from '../../redux/itemRedux';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useIsFocused } from "@react-navigation/native";
import TextInput from '../../components/TextInput';
import Icon from 'react-native-vector-icons/FontAwesome';

export const ItemScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [itemList, setItemList] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const isFocused = useIsFocused();

    const [formData, setFormData] = useState({ searchVal: '' })

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        async function fetchData() {
            let response = await retrieveAllPublishedItems();
            if (response.status) {
                setItemList(response.data);
                setOriginalData(response.data);
            } else {
                console.log("Items not available!");
            }
        }

        if (isFocused) {
            fetchUser();
            fetchData();
        }
    }, [isFocused])

    useEffect(() => {
        setFormData({ ...formData, searchVal: '' });
    }, []); 

    // search bar to search for item name 
    const onSearchPressed = () => {
        if (formData.searchVal === '') {
            setItemList(originalData);
        } else {
            var searchedArr = originalData.filter(function (index) {
                return index.name.includes(formData.searchVal);
            });
            setItemList(searchedArr);
        }
    }

    const viewItem = (item_id) => {
        navigation.navigate('ItemDetailsScreen', { itemId: item_id }); 
    }

    return (
        <Background>
            <ScrollView>
                {itemList && itemList.length > 0 && user && 
                <View style={styles.container}>
                    <View style={{flexDirection: 'row' }}>
                        <TextInput
                            style={{width: 358, marginLeft: 15}}
                            label="Search Item Name ..."
                            returnKeyType="next"
                            value={formData.searchVal}
                            onChangeText={(searchVal) => setFormData({...formData, searchVal})}
                        />

                        <TouchableOpacity style={{marginLeft: -68, marginTop: 30}} onPress={onSearchPressed} >
                            <Icon name="search" style={{ color: '#044537'}} size={20}/> 
                        </TouchableOpacity>
                    </View>

                    {itemList.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => viewItem(item.item_id)}>
                            <Card key={index}>
                                { item.quantity <=5 && (
                                    <Text style={{color:'red', fontSize:10, fontWeight:'bold', marginBottom:10, marginLeft:8}}> SELLING OUT SOON </Text>
                                )}
                                <View>
                                    <Image source={{ uri: item.image }} style={{ width: 330, height: 180, marginLeft:0, marginBottom: 10 }} />
                                    {/* <View style={{alignContent:'center', alignSelf:'center', alignItems:'center'}}></View> */}
                                    <View style={{marginLeft: 5, marginTop:3}}>
                                        <Text style={{ fontSize: 15 , fontWeight:'bold', marginTop:0, color:'#044537'}}> {item.name} </Text>
                                        <Text style={{ fontSize: 11 , fontWeight:'bold', marginTop:3, color:'grey'}}> $ {item.price}.00 </Text>
                                    </View>
                                </View>
                            </Card>
                        </TouchableOpacity>
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