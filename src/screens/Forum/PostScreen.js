import React, { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { Text, Card } from '@rneui/themed';
import { getUser } from '../../helpers/LocalStorage';
import { useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { downvote, getPost, upvote } from '../../redux/postRedux';
import { useIsFocused } from "@react-navigation/native";

const PostScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [post, setPost] = useState();
    const isFocused = useIsFocused();

    const route = useRoute();
    const { postId, catId } = route.params;
    
    const [fetchPost, setFetchPost] = useState(true);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        const fetchData = async (id) => {
            let response = await getPost(id);
            if (response.status) {
                setPost(response.data);
            } else {
                console.log("Post not fetch!");
            }
        };

        if ((postId && fetchPost) || isFocused) {
            fetchUser();
            fetchData(postId);
            setFetchPost(false);
        }
    }, [postId, fetchPost, isFocused]);

    const onUpvotePressed = async () => {
        if (!user.upvoted_user_id_list || !user.upvoted_user_id_list.includes(user.user_id)) {
            const response = await upvote(user.user_id, postId);
            if (response.status) {
                setFetchPost(true);
                console.log('success');
    
            } else {
                console.log('error')
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
            }
        }
    }

    const onDownvotePressed = async () => {
        if (!user.downvoted_user_id_list || !user.downvoted_user_id_list.includes(user.user_id)) {
            const response = await downvote(user.user_id, postId);
            if (response.status) {
                setFetchPost(true);
                console.log('success');
    
            } else {
                console.log('error')
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
            }
        }
    }

    const updatePost = (post, postImageList) => {
        if (postImageList.length > 0) {
            navigation.navigate('UpdatePostScreen', { post: post, catId: catId, imageURL: postImageList[0] });
        } else {
            navigation.navigate('UpdatePostScreen', { post: post, catId, catId, imageURL: null });
        }
    }


    return post ? (
        <Background>
            <ScrollView style={{height: 750}}>
                <Card>
                    <Card.Title style={styles.header}>
                        {post.title}
                    </Card.Title>

                    {post.post_image_list.length > 0 && <Image
                        style={styles.image}
                        source={{uri: post.post_image_list[0]}}
                    />}
                    <Text style={{textAlign: 'justify', marginBottom: 15}} >{post.content}</Text>
                    <Card.Divider />

                    <View style={{flexDirection: 'row'}}>
                        <Ionicons name="arrow-up" style={styles.icon} size={20} color={post && post.upvoted_user_id_list && post.upvoted_user_id_list.includes(user.user_id) ? "red" : "black"} onPress={onUpvotePressed} />
                        <Text style={{marginLeft: 10, marginRight: 15}} >{post.upvoted_user_id_list.length - post.downvoted_user_id_list.length}</Text>
                        <Ionicons name="arrow-down" style={styles.icon} size={20} color={post && post.upvoted_user_id_list && post.downvoted_user_id_list.includes(user.user_id) ? "red" : "black"} onPress={onDownvotePressed} />
                        {post.local_user && <Text style={{marginLeft: 20}}>Posted by {post.local_user.name}</Text>}
                        {post.tourist_user && <Text style={{marginLeft: 20}}>Posted by {post.tourist_user.name}</Text>}
                        {post.internal_staff_user && <Text style={{marginLeft: 20}}>Posted by {post.internal_staff_user.name}</Text>}
                        {post.vendor_staff_user && <Text style={{marginLeft: 20}}>Posted by {post.vendor_staff_user.name}</Text>}

                        {post.local_user && post.local_user.user_id === user.user_id && <Button style={styles.button} mode="contained" onPress={() => updatePost(post, post.post_image_list)}>Update</Button>}
                    </View>

                </Card>
                <ScrollView style={{marginTop: 20, marginLeft: 20, marginRight: 20}}>
                    <Text style={{ textAlign: 'center', fontSize: 20}} >No Comments Written</Text>
                </ScrollView>
            </ScrollView>
        </Background>
    ) : (
        <View></View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    button: {
        marginBottom: -8,
        marginTop: -8,
        marginLeft: 20,
        backgroundColor: '#044537',
        width: 100,
        height: 40,
    },
    image: {
        marginTop: 0,
        marginBottom: 10,
        minWidth: 200,
        minHeight: 200,
    },
    icon: {
        marginLeft: -5,
        marginTop: -2,
        marginBottom: -10,
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

export default PostScreen