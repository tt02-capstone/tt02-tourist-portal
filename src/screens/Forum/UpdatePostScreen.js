import React, {useEffect, useState} from 'react'
import {StyleSheet, View, ScrollView} from 'react-native'
import { useRoute } from '@react-navigation/native';
import Background from '../../components/Background'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput'
import {theme} from '../../core/theme'
import { getUser } from '../../helpers/LocalStorage';
import Toast from "react-native-toast-message";
import InputValidator from "../../helpers/InputValidator";
import { updatePost, deletePost } from '../../redux/postRedux';
import * as ImagePicker from 'expo-image-picker';
import { S3 } from 'aws-sdk';

export const UpdatePostScreen = ({navigation}) => {

    const [user, setUser] = useState('');
    const route = useRoute();
    const { post, catId, imageURL } = route.params;
    const [originalImage, setOriginalImage] = useState(imageURL);
    const [image, setImage] = useState(imageURL);
    const [lastReset, setLastReset] = useState(false);

    const [formData, setFormData] = useState({ // form input fields
        title: post.title,
        content: post.content,
    })

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        fetchUser();
    }, []);

    // upload image
    const S3BUCKET ='tt02/post';
    const TT02REGION ='ap-southeast-1';
    const ACCESS_KEY ='AKIART7KLOHBGOHX2Y7T';
    const SECRET_ACCESS_KEY ='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';
  
    const [file, setFile] = useState(null);
    const [finalURL, setFinalURL] = useState(null);

    const onImagePicker = async () => {
        setFinalURL(null);
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        if (!result.canceled) {
            setFile(result);
            setLastReset(false);
            Toast.show({
                type: 'success',
                text1: 'Image uploaded!'
            })
            console.log("xxx:" + result);
        }
    };

    const onImageClear = () => {
        setFinalURL(null);
        setFile(null);
        setImage(null);
        setLastReset(false);
        Toast.show({
            type: 'success',
            text1: 'Image removed!'
        })
    };

    const onImageReset = () => {
        setImage(originalImage);
        setLastReset(true);
        Toast.show({
            type: 'success',
            text1: 'Image reset!'
        })
    };

    const onUpdatePressed = async () => {

        const titleError = InputValidator.text(formData.title)
        if (titleError) {
            Toast.show({
                type: 'error',
                text1: 'Title is required!'
            })
            return
        }

        const contentError = InputValidator.text(formData.content)
        if (contentError) {
            Toast.show({
                type: 'error',
                text1: 'Please add some description!'
            })
            return
        }

        var imageURL = undefined;
        if (file && !lastReset) { // user uploads a new file
            const s3 = new S3({
                accessKeyId: ACCESS_KEY,
                secretAccessKey: SECRET_ACCESS_KEY,
                region: TT02REGION,
            });

            const uploadImage = async (uri) => {
                let arr = uri.split("/");
                let temp = "user_" + user.user_id + "_cat_item_id_" + catId + "_" + arr[arr.length-1];
    
                const response = await fetch(uri);
                const blob = await response.blob();
                const params = {
                    Bucket: S3BUCKET,
                    Key: temp,
                    Body: blob,
                };
                
                s3.upload(params, function(err, data) {
                if (err) {
                    throw err;
                }
                    imageURL = 'http://tt02.s3-ap-southeast-1.amazonaws.com/post/' + temp;
                    setFinalURL(imageURL);
                    console.log('Image upload to S3 successfully!');
                });
            }
            
            uploadImage(file.assets[0].uri);

        } else if (!image) { // no image
            console.log("update without image");
            let obj = {
                ...post,
                title: formData.title,
                content: formData.content,
                updated_time: new Date(),
                post_image_list: [],
            };

            const response = await updatePost(obj);
            if (response.status) {
                console.log('success');
                setFile(null);
                setFinalURL(null);
                Toast.show({
                    type: 'success',
                    text1: 'Post updated!'
                })

                navigation.navigate('PostScreen', { postId: post.post_id, catId: catId });
            } else {
                console.log('error')
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
            }
        } else if (image && lastReset) { // previous image
            console.log("update with reset image");
            let obj = {
                ...post,
                title: formData.title,
                content: formData.content,
                post_image_list: [image],
                updated_time: new Date(),
            };

            const response = await updatePost(obj);
            if (response.status) {
                console.log('success');
                setFile(null);
                setFinalURL(null);
                Toast.show({
                    type: 'success',
                    text1: 'Post updated!'
                })

                navigation.navigate('PostScreen', { postId: post.post_id, catId: catId });
            } else {
                console.log('error')
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
            }
        }
    }

    useEffect(() => {

        const addPostFunction = async () => {
            let temp = 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/' + finalURL;
            let obj = {
                ...post,
                title: formData.title,
                content: formData.content,
                post_image_list: [finalURL],
                updated_time: new Date(),
            };

            const response = await updatePost(obj);
            if (response.status) {
                console.log('success');
                setFile(null);
                setFinalURL(null);
                Toast.show({
                    type: 'success',
                    text1: 'Post updated!'
                })

                navigation.navigate('PostScreen', { postId: post.post_id, catId: catId });

            } else {
                console.log('error')
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
            }
        }

        if (finalURL) {
            console.log("update with new image");
            addPostFunction();
        }

    }, [finalURL])

    const onDeletePressed = async () => {
        let response = await deletePost(post.post_id);
        if (response.status) {
            Toast.show({
                type: 'success',
                text1: 'Post deleted!'
            })

            navigation.navigate('PostListScreen', { id: catId });
        } else {

            let obj = {
                ...post,
                title: '[deleted]',
                content: '[deleted]',
                post_image_list: [],
                updated_time: new Date(),
            };

            const response = await updatePost(obj);
            if (response.status) {
                console.log('success');
                setFile(null);
                setFinalURL(null);
                Toast.show({
                    type: 'error',
                    text1: 'Post cannot be deleted but content is removed!'
                })

                navigation.navigate('PostScreen', { postId: post.post_id, catId: catId});

            } else {
                console.log('error')
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
            }
        }
    }

    return (
        <Background>
            <ScrollView automaticallyAdjustKeyboardInsets={true} style={{ flexDirection: 'row', maxWidth: '100%', height: 700}}>
                <View style={{alignItems: 'center', minHeight: '100%',}}>
                    <TextInput
                        style={{width: 320}}
                        label="Title"
                        returnKeyType="next"
                        value={formData.title}
                        onChangeText={(title) => setFormData({...formData, title})}
                        errorText={formData.title ? InputValidator.text(formData.title) : ''}
                    />
                    <TextInput
                        style={{width: 320, height: 200 }}
                        label="Description"
                        multiline={true}
                        value={formData.content}
                        onChangeText={(content) => setFormData({...formData, content})}
                        errorText={formData.content ? InputValidator.text(formData.content) : ''}
                    />
                    <Button text="Add Image" style={styles.button} onPress={onImagePicker} />
                    <Button text="Clear Image" style={styles.button} onPress={onImageClear} />
                    <Button text="Reset Image" style={styles.button} onPress={onImageReset} />
                    <Button mode="contained" text={"Update"} onPress={onUpdatePressed} />
                    <Button mode="contained" text={"Delete"} onPress={onDeletePressed} />
                </View>
            </ScrollView>
        </Background>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row', marginTop: 4,
    },
    link: {
        fontWeight: 'bold', color: theme.colors.primary,
    },
    button: {
        minWidth: '80%'
    }
})