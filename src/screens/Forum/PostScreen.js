import React, { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { getUser } from '../../helpers/LocalStorage';
import { useRoute } from '@react-navigation/native';
import Button from '../../components/Button';
import { downvote, getAllPostByCategoryItemId, getPost, upvote } from '../../redux/postRedux';

const PostScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [post, setPost] = useState();

    const route = useRoute();
    const { postId } = route.params; // category id
    
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

        if (postId && fetchPost) {
            fetchUser();
            fetchData(postId);
            setFetchPost(false);
        }
    }, [postId, fetchPost]);

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

    return post ? (
        <Background>
            <View>
                <Text>{post.title}</Text>
                {post.post_image_list.length === 1 && <Text>{post.post_image_list[0]}</Text>}
                <Text>{post.content}</Text>
                <Text>{post.upvoted_user_id_list.length - post.downvoted_user_id_list.length}</Text>
            </View>
            <Button
                mode="contained"
                text={"Upvote"}
                onPress={onUpvotePressed}
            />
            <Button
                mode="contained"
                text={"Downvote"}
                onPress={onDownvotePressed}
            />
            <ScrollView>
                {/* Comments */}
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