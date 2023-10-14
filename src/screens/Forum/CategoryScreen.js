import React, { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getUser } from '../../helpers/LocalStorage';
import { List, MD3Colors } from 'react-native-paper';
import { getAllCategories } from '../../redux/categoryRedux';

const CategoryScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [data, setData] = useState([]);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        const fetchData = async () => {
            let response = await getAllCategories();
            if (response.status) {
                setData(response.data);
            } else {
                console.log("Category list not fetch!");
            }
        };

        fetchUser();
        fetchData();
    }, []);

    const viewCategoryList = (id) => {
        navigation.navigate('CategoryItemScreen', { id: id }); // item.category_id
    }

    return (
        <Background>
            <ScrollView>
                <View style={styles.container}>

                    {data.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => viewCategoryList(item.category_id)}>
                            <Card>
                                <Card.Title style={styles.header}>
                                    <Text>{item.name}</Text>
                                </Card.Title>
                            </Card>
                        </TouchableOpacity>
                    ))
                    }
                </View>
            </ScrollView>
        </Background>
    )
}

const styles = StyleSheet.create({
    container: {

    },
    header: {
        color: '#044537',
        fontSize: 20,
        textAlign: 'left'
    },
    icon: {
        
    }
});

export default CategoryScreen