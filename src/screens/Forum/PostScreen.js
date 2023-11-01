import React, { useState, useEffect, useRef } from 'react';
import Background from '../../components/CardBackground';
import { View, StyleSheet, Image, Text, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { Card } from '@rneui/themed';
import { getUser } from '../../helpers/LocalStorage';
import { useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { downvote, getPost, upvote } from '../../redux/postRedux';
import moment from 'moment';
import { useIsFocused } from "@react-navigation/native";
import { downvoteComment, getAllPostComment, upvoteComment, updateComment, deleteComment, createComment } from '../../redux/commentRedux';
import Toast from "react-native-toast-message";
import CheckboxTree from 'react-native-checkbox-tree';
import TextInput from "../../components/TextInput";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { getPostRecommendation } from '../../redux/recommendationRedux';
import ForumAttractionRecom from './ForumRecommendation/ForumAttractionRecom';
import { theme } from '../../core/theme'
import ForumRestaurantRecom from './ForumRecommendation/ForumRestaurantRecom';
import ForumAccommodationRecom from './ForumRecommendation/ForumAccommodationRecom';

const PostScreen = ({ navigation }) => {

    // post attributes
    const [user, setUser] = useState('');
    const [post, setPost] = useState();
    const isFocused = useIsFocused();
    const ref = useRef();

    const route = useRoute();
    const { postId, catId } = route.params;
    
    const [fetchPost, setFetchPost] = useState(true);

    // comment attributes
    const [comments, setComments] = useState([]);
    const [fetchComment, setFetchComment] = useState(true);
    const [showParentCommentTextInput, setShowParentCommentTextInput] = useState(false);
    const [formData, setFormData] = useState({
        parentComment: ''
    })

    // recommendation
    const [recommendation, setRecommendation] = useState([]);

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    // fetch post
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

    // fetch recommendation
    useEffect(() => {
        const fetchData = async (id) => {
            let response = await getPostRecommendation(id);
            if (response.status) {
                setRecommendation(response.data);
            } else {
                console.log("Recommendation not fetch!");
            }
        }

        if (catId) {
            fetchData(catId);
        }
    }, [catId])

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

    function onReportPostPressed() {
        navigation.navigate('ReportPostScreen', { postId: postId, catId: catId });
    }

    function onReportCommentPressed(commentId) {
        navigation.navigate('ReportCommentScreen', { postId: postId, catId: catId, commentId: commentId });
    }

    // fetch comment
    useEffect(() => {
        const fetchData = async (id) => {
            let response = await getAllPostComment(id);
            if (response.status) {
                setComments([]);
                setComments(response.data);
            } else {
                console.log("Comments not fetch!");
            }
        };

        if ((postId && fetchComment) || isFocused) {
            fetchData(postId);
            setFetchComment(false);
        }
    }, [postId, fetchComment, isFocused]);

    function onNewParentCommentPressed() {
        if (showParentCommentTextInput) {
            setShowParentCommentTextInput(false);
            setFormData({parentComment: ''})
        } else {
            setShowParentCommentTextInput(true);
        }
    }
    
    const onAddNewParentComment = async () => {
        if (formData.parentComment.length <= 0) {
            Toast.show({
                type: 'error',
                text1: 'Please add a message!'
            })
        } else {
            let tempComment = {
                content: formData.parentComment,
                upvoted_user_id_list: [],
                downvoted_user_id_list: [],
                published_time: new Date(),
                updated_time: new Date()
            }
            const response = await createComment(post.post_id, 0, user.user_id, tempComment);
            if (response.status) {
                setFormData({parentComment: ''})
                setFetchComment(true);
                setShowParentCommentTextInput(false);
                Toast.show({
                    type: 'success',
                    text1: 'Commented!'
                })
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

    const onUpvoteCommentPressed = async (commentId) => {
        const response = await upvoteComment(user.user_id, commentId);
        if (response.status) {
            setFetchComment(true);
            console.log('success');

        } else {
            console.log('error')
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }

    const onDownvoteCommentPressed = async (commentId) => {
        const response = await downvoteComment(user.user_id, commentId);
        if (response.status) {
            setFetchComment(true);
            console.log('success');

        } else {
            console.log('error')
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }
    
    // create child comment
    const [showCreateChildCommentModal, setShowCreateChildCommentModal] = useState(false);
    const [parentComment, setParentComment] = useState(null);
    const [formCreateComment, setFormCreateComment] = useState('');

    const addChildComment = (comment) => {
        setShowCreateChildCommentModal(true)
        setParentComment(comment);
    }

    const onCreateChildCommentPressed = async () => {
        if (formCreateComment.length <= 0) {
            Toast.show({
                type: 'error',
                text1: 'Please enter a comment!'
            })
        } else {
            let tempComment = {
                content: formCreateComment,
                upvoted_user_id_list: [],
                downvoted_user_id_list: [],
                published_time: new Date(),
                updated_time: new Date(),
            };

            const response = await createComment(post.post_id, parentComment.comment_id, user.user_id, tempComment);
            if (response.status) {
                setFetchComment(true);
                setShowCreateChildCommentModal(false);
                setParentComment(null);
                setFormCreateComment('');
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

    // update comment
    const [showUpdateCommentModal, setShowUpdateCommentModal] = useState(false);
    const [originalComment, setOriginalComment] = useState(null);
    const [formUpdateComment, setFormUpdateComment] = useState('');

    const onUpdateCommentPressed = (comment) => {
        setFormUpdateComment(comment.content);
        setOriginalComment(comment)
        setShowUpdateCommentModal(true)
    }

    const onModalUpdatePressed = async () => {
        if (formUpdateComment.length <= 0) {
            Toast.show({
                type: 'error',
                text1: 'Please enter a comment!'
            })
        } else {
            let tempComment = {
                comment_id: originalComment.comment_id,
                upvoted_user_id_list: originalComment.upvoted_user_id_list,
                downvoted_user_id_list: originalComment.downvoted_user_id_list,
                published_time: originalComment.published_time,
                content: formUpdateComment, // changed
                updated_time: new Date(), // changed
                is_published: true // cater for new attribute @ backend
            };

            const response = await updateComment(tempComment);
            if (response.status) {
                setFetchComment(true);
                setShowUpdateCommentModal(false);
                setOriginalComment(null);
                setFormUpdateComment('');
                Toast.show({
                    type: 'success',
                    text1: 'Comment Editted!'
                })
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

    const onDeleteCommentPressed = async (comment) => {
        const response = await deleteComment(comment.comment_id);
        if (response.status) {
            setFetchComment(true);
            Toast.show({
                type: 'success',
                text1: 'Comment Deleted!'
            })
            console.log('success');

        } else { // cannot be deleted, so we delete content via update
            let tempComment = {
                comment_id: comment.comment_id,
                upvoted_user_id_list: comment.upvoted_user_id_list,
                downvoted_user_id_list: comment.downvoted_user_id_list,
                published_time: comment.published_time,
                content: '[deleted]', // changed
                updated_time: new Date(), // changed
                is_published: false, // cater for new attribute @ backend
            };

            const response = await updateComment(tempComment);
            if (response.status) {
                setFetchComment(true);
                Toast.show({
                    type: 'success',
                    text1: 'Comment cannot be deleted, but is modified!'
                })
            } else { // update failed
                console.log('error')
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
            }
        }
    }

    // view user
    const viewUserProfile = (userId) => {
        navigation.navigate('ForumProfileScreen', { postId: postId, catId: catId, userId: userId});
    }

    // factor for recommendations 
    const viewRecommendedAttraction = (redirect_attraction_id) => {
        navigation.push('AttractionDetailsScreen', { attractionId: redirect_attraction_id });
    }

    const viewRecommendedRest = (redirect_rest_id) => {
        navigation.push('RestaurantDetailsScreen', { restId: redirect_rest_id });
    }

    const viewRecommendedAccom = (redirect_accom_id) => {
        navigation.push('AccommodationDetailsScreen', { accommodationId: redirect_accom_id });
    }

    const handleItemClick = (item) => {
        if (item.listing_type === "ATTRACTION") {
            viewRecommendedAttraction(item.attraction_id);
        } else if (item.listing_type === "RESTAURANT") {
            viewRecommendedRest(item.restaurant_id);
        } else if (item.listing_type === "ACCOMMODATION") {
            viewRecommendedAccom(item.accommodation_id);
        }
    }

    return post ? (
        <Background>
            <View style={{height: 750}}>
                <Card>
                    {post.local_user && 
                        <View style={{flexDirection: 'row'}}>
                            <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => viewUserProfile(post.local_user.user_id)}>
                                <Image
                                    style={styles.profileImage}
                                    source={{uri: post.local_user.profile_pic ? post.local_user.profile_pic : 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/default_profile.jpg'}}
                                />
                                <Text style={{marginLeft: 10, marginTop: 6, fontSize: 15, fontWeight: 'bold'}}>{post.local_user.name}</Text>
                            </TouchableOpacity>

                            {post.local_user.user_id === user.user_id && 
                                <TouchableOpacity style={{marginLeft: 160}} mode="text" onPress={() => updatePost(post, post.post_image_list)}>
                                    <Ionicons name="create-outline" style={{ color: 'black'}} size={25}/>
                                </TouchableOpacity>
                            }
                        </View>
                    }

                    {post.tourist_user && 
                        <View style={{flexDirection: 'row'}}>
                            <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => viewUserProfile(post.tourist_user.user_id)}>
                                <Image
                                    style={styles.profileImage}
                                    source={{uri: post.tourist_user.profile_pic ? post.tourist_user.profile_pic : 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/default_profile.jpg'}}
                                />
                                <Text style={{marginLeft: 10, marginTop: 6, fontSize: 15, fontWeight: 'bold'}}>{post.tourist_user.name}</Text>
                            </TouchableOpacity>

                            {post.tourist_user.user_id === user.user_id && 
                                <TouchableOpacity style={{marginLeft: 180}} mode="text" onPress={() => updatePost(post, post.post_image_list)}>
                                    <Ionicons name="create-outline" style={{ color: 'black'}} size={25}/>
                                </TouchableOpacity>
                            }
                        </View>
                    }

                    {post.internal_staff_user && 
                        <View style={{flexDirection: 'row'}}>
                              <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => viewUserProfile(post.internal_staff_user.user_id)}>
                                <Image
                                    style={styles.profileImage}
                                    source={{uri: post.internal_staff_user.profile_pic ? post.internal_staff_user.profile_pic : 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/default_profile.jpg'}}
                                />
                                <Text style={{marginLeft: 10, marginTop: 6, fontSize: 15, fontWeight: 'bold'}}>{post.internal_staff_user.name}</Text>
                            </TouchableOpacity>

                            {post.internal_staff_user.user_id === user.user_id && 
                                <TouchableOpacity style={{marginLeft: 180}} mode="text" onPress={() => updatePost(post, post.post_image_list)}>
                                    <Ionicons name="create-outline" style={{ color: 'black'}} size={25}/>
                                </TouchableOpacity>
                            }
                        </View>
                    }

                    {post.vendor_staff_user && 
                        <View style={{flexDirection: 'row'}}>
                             <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => viewUserProfile(post.vendor_staff_user.user_id)}>
                                <Image
                                    style={styles.profileImage}
                                    source={{uri: post.vendor_staff_user.profile_pic ? post.vendor_staff_user.profile_pic : 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/default_profile.jpg'}}
                                />
                                <Text style={{marginLeft: 10, marginTop: 6, fontSize: 15, fontWeight: 'bold'}}>{post.vendor_staff_user.name}</Text>
                            </TouchableOpacity>

                            {post.vendor_staff_user.user_id === user.user_id && 
                                <TouchableOpacity style={{marginLeft: 180}} mode="text" onPress={() => updatePost(post, post.post_image_list)}>
                                    <Ionicons name="create-outline" style={{ color: 'black'}} size={25}/>
                                </TouchableOpacity>
                            }
                        </View>
                    }
                    <Card.Divider />
                    <Card.Title style={styles.header}>
                        {post.title}
                    </Card.Title>

                    {post.post_image_list && post.post_image_list.length > 0 && <Image
                        style={styles.image}
                        source={{uri: post.post_image_list[0]}}
                    />}
                    <Text style={{textAlign: 'justify', marginBottom: 15}} >{post.content}</Text>
                    <Card.Divider />

                    <View style={{flexDirection: 'row'}}>
                        <Ionicons name="arrow-up" style={styles.icon} size={20} color={post && post.upvoted_user_id_list && post.upvoted_user_id_list.includes(user.user_id) ? "red" : "black"} onPress={onUpvotePressed} />
                        <Text style={{marginLeft: 10, marginRight: 15, color: post.upvoted_user_id_list && post.upvoted_user_id_list.includes(user.user_id) ? "red" : "black"}} >{post.upvoted_user_id_list ? post.upvoted_user_id_list.length : 0}</Text>
                        <Ionicons name="arrow-down" style={styles.icon} size={20} color={post && post.upvoted_user_id_list && post.downvoted_user_id_list.includes(user.user_id) ? "red" : "black"} onPress={onDownvotePressed} />

                        <TouchableOpacity style={{marginLeft: 45, marginTop: -5}} mode="text" onPress={onNewParentCommentPressed}>
                                    <Ionicons name="brush" style={{ color: 'black'}} size={25}/>
                        </TouchableOpacity>

                        <TouchableOpacity style={{marginLeft: 20, marginTop: -5}} mode="text" onPress={onReportPostPressed}>
                        <Ionicons name="flag" style={{ color: 'black'}} size={25}/>
                        </TouchableOpacity>
                        
                        <Text style={{marginLeft: 20, marginTop: 3}} >Last edit: {moment(post.publish_time).format('LT')}</Text>
                    </View>

                    {/* recommendation */}
                    <View style={{marginBottom: -15}}>
                        {recommendation && recommendation.length > 0 && <Text style={{marginLeft: 0, marginTop: 15, marginBottom: -10, fontSize: 15, fontWeight: 'bold'}}>Nearby Recommendations</Text>}
                        {recommendation.length > 0 && (
                            <ScrollView horizontal>
                                <View style={{ flexDirection: 'row', height: 120}}>
                                    {
                                        recommendation.map((item, index) => (
                                            <TouchableOpacity key={index} onPress={() => handleItemClick(item)}>
                                                {item.listing_type === 'ATTRACTION' && (
                                                    <ForumAttractionRecom item={item} />
                                                )}
                                                {item.listing_type === 'RESTAURANT' && (
                                                    <ForumRestaurantRecom item={item} />
                                                )}
                                                {item.listing_type === 'ACCOMMODATION' && (
                                                    <ForumAccommodationRecom item={item} />
                                                )}
                                            </TouchableOpacity>
                                        ))
                                    }
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </Card>

                {/* Comments from here onwards */}
                {comments && comments.length > 0 && <Text style={{marginLeft: 20, marginTop: 10, fontSize: 15, fontWeight: 'bold'}}>Comments</Text>}
                <View style={{height: 370, width: 360, marginLeft: 5}}>
                    {showParentCommentTextInput &&
                        <View style={{flexDirection: 'row', marginTop: -10, marginBottom: -15}}>
                            <TextInput
                                label="Add New Comment"
                                returnKeyType="next"
                                style={{width: 270, height: 30, marginLeft: 15}}
                                value={formData.parentComment}
                                onChangeText={(parentComment) => setFormData({...formData, parentComment })}
                                autoCapitalize="none"
                            />
                            <Button style={{marginLeft: -70, marginTop: 15}} onPress={() => onAddNewParentComment()}>
                                <Text style={{color: '#044537', fontWeight: 'bold'}}>Submit</Text>
                            </Button>
                        </View>
                    }

                    {(!comments || (comments && comments.length === 0)) && <Text style={{ textAlign: 'center', fontSize: 20, marginTop: 20}} >No Comments Written</Text>}

                    {/* comment tree */}
                    <View style={styles.container}>
                        {comments && comments.length > 0 && 
                        <CheckboxTree
                            ref={ref}
                            clear
                            data={comments}
                            textField="content"
                            childField="child_comment_list"
                            textStyle={{ color: 'black' }}
                            iconColor="black"
                            iconSize={26}
                            openIcon={<AntDesign name="arrowdown" size={26} />}
                            closeIcon={<AntDesign name="arrowright" size={26} />}
                            onSelect={item => {}}
                            renderItem={({ item, isSelect, isOpen, onOpen, onClose, onSelect }) => (
                                <TouchableOpacity style={styles.commentContainer} onPress={isOpen ? onClose : onOpen}>
                                    <View style={{flexDirection: 'column',}}>
                                        {item.tourist_user && <Text style={{fontSize: 15, fontWeight: 'bold'}} onPress={() => viewUserProfile(item.tourist_user.user_id)}>{item.tourist_user.name}  <Text style={{marginLeft: 5, marginRight: 5, marginTop: 2, fontSize:10 }}>{moment(item.updated_time).format('LT')}</Text> </Text>}
                                        {item.local_user && <Text style={{fontSize: 15, fontWeight: 'bold'}} onPress={() => viewUserProfile(item.local_user.user_id)}>{item.local_user.name}  <Text style={{marginLeft: 5, marginRight: 5, marginTop: 2, fontSize:10 }}>{moment(item.updated_time).format('LT')}</Text> </Text>}
                                        {item.vendor_staff_user && <Text style={{fontSize: 15, fontWeight: 'bold'}} onPress={() => viewUserProfile(item.vendor_staff_user.user_id)}>{item.vendor_staff_user.name}  <Text style={{marginLeft: 5, marginRight: 5, marginTop: 2, fontSize:10 }}>{moment(item.updated_time).format('LT')}</Text> </Text>}
                                        {item.internal_staff_user && <Text style={{fontSize: 15, fontWeight: 'bold'}} onPress={() => viewUserProfile(item.internal_staff_user.user_id)}>{item.internal_staff_user.name}  <Text style={{marginLeft: 5, marginRight: 5, marginTop: 2, fontSize:10 }}>{moment(item.updated_time).format('LT')}</Text> </Text>}
                                        <Text style={{fontSize: 15, marginBottom: 10, marginTop: 5}}>{item.content}</Text>

                                        <View style={{flexDirection: 'row',}}>
                                            { item.is_published && (
                                                <>
                                                    <Ionicons name="arrow-up" size={20} color={item && item.upvoted_user_id_list && item.upvoted_user_id_list.includes(user.user_id) ? "red" : "black"} onPress={() => onUpvoteCommentPressed(item.comment_id)} />
                                                    <Text style={{marginLeft: 5, marginRight: 4, marginTop: 2, color: item.upvoted_user_id_list && item.upvoted_user_id_list.includes(user.user_id) ? "red" : "black"}} >{item.upvoted_user_id_list ? item.upvoted_user_id_list.length : 0}</Text>
                                                    <Ionicons name="arrow-down" size={20} color={item && item.upvoted_user_id_list && item.downvoted_user_id_list.includes(user.user_id) ? "red" : "black"} onPress={() => onDownvoteCommentPressed(item.comment_id)} />
                                                </>
                                            )}
                                            
                                            <Text style={{marginLeft: 5, marginRight: 10, marginTop: 2}}>{item.child_comment_list ? item.child_comment_list.length : 0} Replies</Text>
                                            {item.is_published &&  <Text style={{marginLeft: 5, marginRight: 5, marginTop: 2, color: '#044537', fontWeight: 'bold'}} onPress={() => addChildComment(item)}>Reply</Text>}

                                            {item.local_user && item.local_user?.user_id === user.user_id && item.is_published && <Text style={{marginLeft: 5, marginRight: 5, marginTop: 2, color: '#044537', fontWeight: 'bold'}} onPress={() => onUpdateCommentPressed(item)}>Edit</Text>}
                                            {item.tourist_user && item.tourist_user?.user_id === user.user_id && item.is_published && <Text style={{marginLeft: 5, marginRight: 5, marginTop: 2, color: '#044537', fontWeight: 'bold'}} onPress={() => onUpdateCommentPressed(item)}>Edit</Text>}

                                            {item.local_user && item.local_user?.user_id === user.user_id && item.is_published && <Text style={{marginLeft: 5, marginRight: 5, marginTop: 2, color: '#044537', fontWeight: 'bold'}} onPress={() => onDeleteCommentPressed(item)}>Delete</Text>}
                                            {item.tourist_user && item.tourist_user?.user_id === user.user_id && item.is_published && <Text style={{marginLeft: 5, marginRight: 5, marginTop: 2, color: '#044537', fontWeight: 'bold'}} onPress={() => onDeleteCommentPressed(item)}>Delete</Text>}

                                            {item.local_user && item.local_user?.user_id !== user.user_id && item.is_published && <Text style={{marginLeft: 5, marginRight: 5, marginTop: 2, color: '#044537', fontWeight: 'bold'}} onPress={() => onReportCommentPressed(item.comment_id)}>Report</Text>}
                                            {item.tourist_user && item.tourist_user?.user_id !== user.user_id && item.is_published && <Text style={{marginLeft: 5, marginRight: 5, marginTop: 2, color: '#044537', fontWeight: 'bold'}} onPress={() => onReportCommentPressed(item.comment_id)}>Report</Text>}
                                            {item.vendor_staff_user && item.vendor_staff_user?.user_id !== user.user_id && item.is_published && <Text style={{marginLeft: 5, marginRight: 5, marginTop: 2, color: '#044537', fontWeight: 'bold'}} onPress={() => onReportCommentPressed(item.comment_id)}>Report</Text>}

                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                        }
                    </View>
                </View>
            </View>

            {/* create child comment modal */}
            <View style={styles.centeredView}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showCreateChildCommentModal}
                    onRequestClose={() => {
                        setShowCreateChildCommentModal(false);
                    }}
                >

                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Reply to {parentComment?.content}</Text>

                            <TextInput
                                label="Add New Comment"
                                multiline={true}
                                style={{width: 260, marginLeft: -10}}
                                value={formCreateComment}
                                onChangeText={(formCreateComment) => setFormCreateComment(formCreateComment)}
                                autoCapitalize="none"
                            />
                            
                            <View style={{flexDirection: 'row'}}>
                                {/* submit modal button */}
                                <Pressable
                                    style={[styles.modalButton, styles.buttonClose]}
                                    onPress={() => onCreateChildCommentPressed()}>
                                    <Text style={styles.textStyle}>Reply</Text>
                                </Pressable>

                                {/* close modal button */}
                                <Pressable
                                    style={[styles.modalButton, styles.buttonClose]}
                                    onPress={() => {
                                        setShowCreateChildCommentModal(false);
                                        setParentComment(null);
                                        setFormCreateComment('');
                                    }}>
                                    <Text style={styles.textStyle}>Cancel</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>

            {/* update comment modal */}
            <View style={styles.centeredView}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showUpdateCommentModal}
                    onRequestClose={() => {
                        setShowUpdateCommentModal(false);
                    }}
                >

                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Reply to {parentComment?.content}</Text>

                            <TextInput
                                multiline={true}
                                style={{width: 260, marginLeft: -15}}
                                value={formUpdateComment}
                                onChangeText={(formUpdateComment) => setFormUpdateComment(formUpdateComment)}
                                autoCapitalize="none"
                            />
                            
                            <View style={{flexDirection: 'row'}}>
                                {/* submit modal button */}
                                <Pressable
                                    style={[styles.modalButton, styles.buttonClose]}
                                    onPress={() => onModalUpdatePressed()}>
                                    <Text style={styles.textStyle}>Edit</Text>
                                </Pressable>

                                {/* close modal button */}
                                <Pressable
                                    style={[styles.modalButton, styles.buttonClose]}
                                    onPress={() => {
                                        setShowUpdateCommentModal(false);
                                        setOriginalComment(null)
                                        setFormUpdateComment('');
                                    }}>
                                    <Text style={styles.textStyle}>Cancel</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </Background>
    ) : (
        <Background></Background>
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
        marginLeft: 130,
        backgroundColor: '#044537',
        width: 80,
        height: 40,
    },
    profileImage: {
        marginTop: 0,
        marginBottom: 15,
        borderRadius: 300 / 2,
        width: 20,
        height: 20,
    },
    image: {
        marginTop: 0,
        marginBottom: 10,
        width: 320,
        height: 140,
    },
    profileImage: {
        marginTop: 0,
        marginBottom: 10,
        borderRadius: 300 / 2,
        width: 30,
        height: 30,
    },
    icon: {
        marginLeft: -5,
        marginTop: -2,
        marginBottom: -10,
    },
    header: {
        color: '#044537',
        fontSize: 15,
        minWidth: '100%',
        marginTop: -5,
        marginBottom: 5,
    },
    card: {
        marginBottom: 16,
    },
    commentContainer: {
        flexDirection: 'row',
        marginVertical: 8,
        width: 500,
        marginLeft: 10,
        paddingLeft: 10,
        borderLeftWidth: 1,
    },
    commentWrapItem: {
        flexDirection: 'row',
        marginVertical: 8,
        width: 500,
    },
    commentText: {
        fontSize: 15,
        marginBottom: 7,
    },
    commentIconItem:{
        marginHorizontal: 8
    },
    commentProfileImage: {
        marginTop: 5,
        marginBottom: 10,
        marginLeft: 5,
        borderRadius: 300 / 2,
        width: 20,
        height: 20,
    },
    commentButton: {
        marginBottom: -8,
        marginTop: -8,
        backgroundColor: '#044537',
        width: 80,
        height: 40,
    },
    name: {
        fontSize: 10,
        marginLeft: 8,
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 250,
        width: 300,
        marginTop: -100
    },
    modalButton: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginLeft: 10,
        marginRight: 10,
        width: 100,
        backgroundColor: '#044537',
    },
    buttonOpen: {
        backgroundColor: '#044537',
    },
    buttonClose: {
        backgroundColor: '#044537',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
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
});

export default PostScreen