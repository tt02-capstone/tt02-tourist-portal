import React, {useState, useEffect} from 'react'
import { StyleSheet } from 'react-native'
import { useIsFocused } from "@react-navigation/native";
import { theme } from '../../core/theme';
import Button from "../../components/Button";
import { storeUser, getUser } from '../../helpers/LocalStorage'
import Toast from "react-native-toast-message";
import CustomFileUpload from '../../components/CustomFileUpload';
import moment from 'moment';
import AWS from 'aws-sdk';
import { uploadNewProfilePic } from '../../redux/userRedux';
window.Buffer = window.Buffer || require("buffer").Buffer;

export const ViewProfileScreen = ({route, navigation}) => {

    const isFocused = useIsFocused();
    const [user, setUser] = useState();

    useEffect(() => {
        async function fetchData() {
            console.log("view profile fetch");
            const userData = await getUser()
            console.log(userData);
            setUser(userData)
        }

        if (isFocused) {
            fetchData();   
        }

    }, [isFocused])

    // upload image


    const S3BUCKET ='tt02/user'; // if you want to save in a folder called 'attraction', your S3BUCKET will instead be 'tt02/attraction'
    const TT02REGION ='ap-southeast-1';
    const ACCESS_KEY ='AKIART7KLOHBGOHX2Y7T';
    const SECRET_ACCESS_KEY ='xsMGhdP0XsZKAzKdW3ED/Aa5uw91Ym5S9qz2HiJ0';
  
    const [file, setFile] = useState(null);
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setFile(file);
    };
  
    const uploadFile = async () => {
        if (file) {
            const S3_BUCKET = S3BUCKET;
            const REGION = TT02REGION;
        
            AWS.config.update({
                accessKeyId: ACCESS_KEY,
                secretAccessKey: SECRET_ACCESS_KEY,
            });
            const s3 = new AWS.S3({
                params: { Bucket: S3_BUCKET },
                region: REGION,
            });
        
            const params = {
                Bucket: S3_BUCKET,
                Key: file.name,
                Body: file,
            };
        
            var upload = s3
                .putObject(params)
                .on("httpUploadProgress", (evt) => {
                console.log(
                    "Uploading " + parseInt((evt.loaded * 100) / evt.total) + "%"
                );
                })
                .promise();
        
            await upload.then((err, data) => {
                console.log(err);
            });

            let str = 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/' + file.name;
            const fetchData = async (userId, str) => {
                const response = await uploadNewProfilePic({user_id: userId, profile_pic: str});
                if (response.status) {
                    console.log("image url saved in database")
                    await storeUser(response.data);
                    const userData = await getUser()
                    setUser(userData);
                    setFile(null);
                    Toast.show({
                        type: 'success',
                        text1: 'Upload Successful!'
                    })

                } else {
                    console.log("User image URL in database not updated!");
                }
            }

            fetchData(user.user_id, str);
            setFile(null);
        } else {
            Toast.show({
                type: 'error',
                text1: 'Please select a image!'
            })
        }
    };

    return user ? (
        <div>
            <div style={{marginBottom: '60px'}}></div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <img 
                    src={user.profile_pic ? user.profile_pic : 'http://tt02.s3-ap-southeast-1.amazonaws.com/user/default_profile.jpg'}
                    style={{borderRadius: '50%', width: '200px', height: '200px'}}
                />
            </div>
            <div style={{marginTop: '30px'}}></div>
            <CustomFileUpload style={styles.uploadButton} handleFileChange={handleFileChange} uploadFile={uploadFile}/>
            <div style={{marginTop: '30px'}}></div>
            <div >
                <div style={styles.mainContent} >
                    {user.name}
                </div>
                <div style={styles.content} >
                    {user.email}
                </div>
                <div style={styles.content} >
                    {moment(user.date_of_birth).format('LL')}
                </div>
                <div style={styles.content} >
                    {user.country_code + " " + user.mobile_num}
                </div>
                <div style={styles.content} >
                    <Button text="Edit Profile" onPress={() => navigation.navigate('EditProfileScreen')} />
                </div>
                <div style={styles.content} >
                    <Button text="Edit Password" onPress={() => navigation.navigate('EditPasswordScreen')} />
                </div>
            </div>
        </div>
    ) : 
    (<div></div>)
}

const styles = StyleSheet.create({
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
    content: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px',
    }
})