import React, { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getUser } from '../../helpers/LocalStorage';
import { useRoute } from '@react-navigation/native';
import { getAllByCategoryId } from '../../redux/categoryItemRedux';

const CategoryItemScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [data, setData] = useState([]);

    const route = useRoute();
    const { id } = route.params; // category id

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        const fetchData = async (id) => {
            let response = await getAllByCategoryId(id);
            if (response.status) {
                setData(response.data);
            } else {
                console.log("Category item list not fetch!");
            }
        };

        fetchUser();
        fetchData(id);
    }, [id]);

    const viewPostList = (id) => {
        navigation.navigate('PostListScreen', { id: id }); // item.category_item_id
    }

    return (
        <Background>
            <ScrollView>
                <View style={styles.container}>

                    {data.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => viewPostList(item.category_item_id)}>
                            <Card>
                                <Card.Title style={styles.header}>
                                    {item.name}
                                </Card.Title>
                                <Card.Image
                                    style={{ padding: 0, height: 200 }}
                                    source={{
                                        uri: item.image
                                    }}
                                />
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
        width: 100,
        fontSize: 11,
        fontWeight: 'bold'
    },
    header: {
        color: '#044537',
        fontSize: 15
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
        marginBottom: 5,
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
});

export default CategoryItemScreen