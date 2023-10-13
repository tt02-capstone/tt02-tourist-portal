import React, { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getUser } from '../../helpers/LocalStorage';
import { useRoute } from '@react-navigation/native';
import Button from '../../components/Button';
import { getAllPostByCategoryItemId } from '../../redux/postRedux';

const PostListScreen = ({ navigation }) => {
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
            let response = await getAllPostByCategoryItemId(id);
            if (response.status) {
                setData(response.data);
            } else {
                console.log("Post list not fetch!");
            }
        };

        if (id) {
            fetchUser();
            fetchData(id);
        }
    }, [id]);

    const viewPost = (id) => {
        navigation.navigate('PostScreen', { postId: id }); // item.post_id
    }

    const createPost = () => {
        navigation.navigate('CreatePostScreen', { categoryItemId: id }); // item.category_item_id
    }

    return (
        <Background>
            <ScrollView>
                <View style={styles.container}>

                    {data.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => viewPost(item.post_id)}>
                            <Card>
                                <Card.Title style={styles.header}>
                                    {item.title}
                                </Card.Title>
                            </Card>
                        </TouchableOpacity>
                    ))
                    }
                    <Button
                        mode="contained"
                        text={"Create"}
                        onPress={createPost}
                    />
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
        minWidth: '100%'
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