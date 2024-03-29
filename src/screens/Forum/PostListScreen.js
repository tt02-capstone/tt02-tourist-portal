import React, { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import TextInput from '../../components/TextInput'
import { Card } from '@rneui/themed';
import { getUser } from '../../helpers/LocalStorage';
import { useRoute } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { getAllPostByCategoryItemId } from '../../redux/postRedux';
import { useIsFocused } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons';

const PostListScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [originalData, setOriginalData] = useState([]);
    const [data, setData] = useState([]);
    const isFocused = useIsFocused();

    const route = useRoute();
    const { id } = route.params; // category id

    const [formData, setFormData] = useState({ // form input fields
        searchVal: ''
    })

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        const fetchData = async (id) => {
            let response = await getAllPostByCategoryItemId(id);
            if (response.status) {
                setData(response.data);
                setOriginalData(response.data);
            } else {
                console.log("Post list not fetch!");
            }
        };

        if (id || isFocused) {
            fetchUser();
            fetchData(id);
        }
    }, [id, isFocused]);

    const viewPost = (postId) => {
        navigation.navigate('PostScreen', { postId: postId, catId: id });
    }

    const createPost = () => {
        navigation.navigate('CreatePostScreen', { categoryItemId: id }); // item.category_item_id
    }

    const onSearchPressed = () => {
        if (formData.searchVal === '') {
            setData(originalData);
        } else {
            var searchedArr = originalData.filter(function (index) {
                return index.title.includes(formData.searchVal);
            });
            setData(searchedArr);
        }
    }

    return (
        <Background>
            <ScrollView>
                <View style={styles.container}>

                    <View style={{flexDirection: 'row'}}>
                        <View style={{flexDirection: 'row'}}>
                            <TextInput
                                style={{width: 285, marginLeft: 10}}
                                label="Search title..."
                                returnKeyType="next"
                                value={formData.searchVal}
                                onChangeText={(searchVal) => setFormData({...formData, searchVal})}
                            />

                            <TouchableOpacity style={{marginLeft: -80, marginTop: 30}} onPress={onSearchPressed} >
                                <Ionicons name="search-outline" style={{ color: 'black'}} size={20}/> 
                            </TouchableOpacity>
                        </View>
                    
                        <Button mode="contained" style={{height:50, marginLeft: -23, marginTop:18, backgroundColor: '#044537'}} onPress={createPost}>
                            <Ionicons name="add-outline" style={{ color: 'white', paddingTop:7, backgroundColor: '#044537'}} size={24}/> 
                        </Button>
                    </View>

                    {data.map((item, index) => (
                        item.is_published && (
                            <TouchableOpacity key={index} onPress={() => viewPost(item.post_id)}>
                                <Card>
                                    <Card.Title style={styles.header}>
                                        {item.title}
                                    </Card.Title>
                                </Card>
                            </TouchableOpacity>
                        )
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
        alignItems: 'center',
    },
    header: {
        color: '#044537',
        fontSize: 15,
        minWidth: '100%',
        textAlign: 'left',
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

export default PostListScreen