import React, {useState, useEffect} from 'react'
import { StyleSheet, View, Text, Image } from 'react-native'
import { useIsFocused } from "@react-navigation/native";
import { theme } from '../../core/theme';
import Button from "../../components/Button";
import { storeUser, getUser } from '../../helpers/LocalStorage'
import Toast from "react-native-toast-message";
import moment from 'moment';
import * as ImagePicker from 'expo-image-picker';
import { S3 } from 'aws-sdk';
import { uploadNewProfilePic } from '../../redux/userRedux';
import Background from '../../components/Background';

window.Buffer = window.Buffer || require("buffer").Buffer;

export const ViewProfileScreen = ({route, navigation}) => {

    const [fetchProfile, setFetchProfile] = useState(false);
    const isFocused = useIsFocused();
    const [user, setUser] = useState();

    useEffect(() => {
        async function fetchData() {
            console.log("view profile fetch");
            const userData = await getUser()
            console.log(userData);
            setUser(userData)
            setFetchProfile(null);
        }

        if (isFocused || fetchProfile) {
            fetchData();   
        }

    }, [isFocused, fetchProfile])

    // upload image
    const S3BUCKET ='tt02/user';
    const TT02REGION ='ap-southeast-1';
    const ACCESS_KEY ='AKIART7KLOHBGOHX2Y7T';
    const SECRET_ACCESS_KEY ='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';
  
    const [file, setFile] = useState(null);
    const [finalURL, setFinalURL] = useState();

    const onImagePicker = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        if (!result.canceled) {
          setFile(result);
          console.log("xxx:" + result);
        }
    };

    useEffect(() => {
        if (file && user) {
            const s3 = new S3({
                accessKeyId: ACCESS_KEY,
                secretAccessKey: SECRET_ACCESS_KEY,
                region: TT02REGION,
            });

            const uploadImage = async (uri) => {
                let arr = uri.split("/");
                let temp = "user_" + user.user_id + "_" + arr[arr.length-1];
    
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
                    setFinalURL(temp);
                    console.log('Image upload to S3 successfully!');
                });
            }
            
            uploadImage(file.assets[0].uri);
        }
    }, [file]);

    useEffect(() => {
        if (finalURL) {
            const saveToDB = async (userId, uri) => {
                let temp = 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/' + finalURL;
                console.log("temp: " + temp);
                const apiResponse = await uploadNewProfilePic({user_id: userId, profile_pic: temp});
                if (apiResponse.status) {
                    console.log("image url saved in database")
                    await storeUser(apiResponse.data);
                    const userData = await getUser()
                    setUser(userData);
                    setFetchProfile(true);
                    setFile(null);
                    Toast.show({
                        type: 'success',
                        text1: 'Upload Successful!'
                    })

                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Please select a image!'
                    })
                };
            }

            saveToDB(user.user_id, finalURL);
            setFinalURL(undefined);
            setFile(null);
        }
    }, [finalURL]);

    return user ? (
        <Background>
            <View style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Image
                    style={styles.image}
                    source={{uri: user.profile_pic ? user.profile_pic : 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/default_profile.jpg'}}
                />
            </View>

            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Text style={styles.mainContent} >
                    {user.name}
                </Text>
                <Text style={styles.mainContent} >
                    {user.email}
                </Text>
                <Text style={styles.mainContent} >
                    {moment(user.date_of_birth).format('LL')}
                </Text>
                <Text style={styles.mainContent} >
                    {user.country_code + " " + user.mobile_num}
                </Text>
                <Button text="Enter Photo Gallery" style={styles.button} onPress={onImagePicker} />
                <Button text="Edit Profile" style={styles.button} onPress={() => navigation.navigate('EditProfileScreen')} />
                <Button text="Edit Password" style={styles.button} onPress={() => navigation.navigate('EditPasswordScreen')} />
                <Button text="View Payment Methods" style={styles.button} onPress={() => navigation.navigate('CreditCardsScreen')} />
            </View>
        </Background>
    ) : 
    (<Text></Text>)
}

const styles = StyleSheet.create({
    image: {
        marginTop: 30,
        marginBottom: 50,
        borderRadius: 300 / 2,
        minWidth: 300,
        minHeight: 300,
    },
    uploadButton: {
        display: 'flex',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 21,
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    button: {
        minWidth: '80%'
    }
})