import React, {useContext, useEffect, useState} from 'react'
import {Pressable, StyleSheet, Switch, TextComponent, View, ScrollView} from 'react-native'
import {List, Paragraph, RadioButton, Text, ToggleButton} from 'react-native-paper'
import { useRoute } from '@react-navigation/native';
import Background from '../../components/Background'
import Header from '../../components/Header'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput'
import {theme} from '../../core/theme'
import { getUser } from '../../helpers/LocalStorage';
import Toast from "react-native-toast-message";
import InputValidator from "../../helpers/InputValidator";
import CustomButton from "../../components/CustomButton";
import { createPost } from '../../redux/postRedux';
import * as ImagePicker from 'expo-image-picker';
import { S3 } from 'aws-sdk';

export const CreatePostScreen = ({navigation}) => {

    const [user, setUser] = useState('');
    const route = useRoute();
    const { categoryItemId } = route.params; // category id

    const [formData, setFormData] = useState({ // form input fields
        title: "",
        content: "",
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
            Toast.show({
                type: 'success',
                text1: 'Image uploaded!'
            })
            console.log("xxx:" + result);
        }
    };

    const onCreatePressed = async () => {

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
        if (file && user && categoryItemId) {
            const s3 = new S3({
                accessKeyId: ACCESS_KEY,
                secretAccessKey: SECRET_ACCESS_KEY,
                region: TT02REGION,
            });

            const uploadImage = async (uri) => {
                let arr = uri.split("/");
                let temp = "user_" + user.user_id + "_cat_item_id_" + categoryItemId + "_" + arr[arr.length-1];
    
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

        } else if (user && categoryItemId) { // no image
            let obj = {
                title: formData.title,
                content: formData.content,
                published_time: new Date(),
                updated_time: new Date(),
                upvoted_user_id_list: [],
                downvoted_user_id_list: []
            };

            const response = await createPost(user.user_id, categoryItemId, obj);
            if (response.status) {
                console.log('success');
                setFile(null);
                setFinalURL(null);
                Toast.show({
                    type: 'success',
                    text1: 'Post created!'
                })

                setTimeout(() => {
                    navigation.reset({
                        index: 0,
                        routes: [{name: 'PostListScreen'}],
                    })
                }, 700);
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
                title: formData.title,
                content: formData.content,
                post_image_list: [finalURL],
                published_time: new Date(),
                updated_time: new Date(),
                upvoted_user_id_list: [],
                downvoted_user_id_list: []
            };

            const response = await createPost(user.user_id, categoryItemId, obj);
            if (response.status) {
                console.log('success');
                setFile(null);
                setFinalURL(null);
                Toast.show({
                    type: 'success',
                    text1: 'Post created!'
                })

                console.log("create", categoryItemId);
                navigation.navigate('PostListScreen', { id: categoryItemId }); // item.category_item_id

            } else {
                console.log('error')
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
            }
        }

        if (finalURL) {
            addPostFunction();
        }

    }, [finalURL])

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
                    <Button
                        mode="contained"
                        text={"Create"}
                        onPress={onCreatePressed}
                    />
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