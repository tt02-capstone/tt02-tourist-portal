import React, {useState, useEffect, useContext} from 'react'
import Background from '../../components/Background'
import Header from '../../components/Header'
import TextInput from '../../components/TextInput'
import Button from '../../components/Button'
import InputValidator from '../../helpers/InputValidator'
import Toast from "react-native-toast-message";
import { View, ScrollView } from 'react-native';
import { getUser } from '../../helpers/LocalStorage'
import { DatePickerInput } from 'react-native-paper-dates';
import { editLocalProfile } from '../../redux/localRedux';
import { editTouristProfile } from '../../redux/touristRedux';
import { storeUser } from '../../helpers/LocalStorage';
import {AuthContext, TOKEN_KEY} from "../../helpers/AuthContext";
import * as SecureStore from 'expo-secure-store';

export const EditProfileScreen = ({route, navigation}) => {

    const authContext = useContext(AuthContext);

    const [user, setUser] = useState();
    const [inputDate, setInputDate] = React.useState();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        countryCode: "",
        mobileNum: "",
        password: "",
    })

    useEffect(() => {
        async function fetchData() {
            const userData = await getUser()
            setUser(userData);
            setInputDate(new Date(userData.date_of_birth));
            setFormData({
                name: userData.name,
                email: userData.email,
                countryCode: userData.country_code,
                mobileNum: userData.mobile_num,
                password: "",
            })
        }

        fetchData();
    }, [])

    const onEditProfilePressed = async () => {
        if (InputValidator.name(formData.name) === '' &&
            InputValidator.email(formData.email) === '' &&
            InputValidator.countryCode(formData.countryCode) === '' &&
            InputValidator.mobileNo(formData.mobileNum) === '' &&
            InputValidator.password(formData.password) === '') {

            // console.log(inputDate)
            let newDate = inputDate;
            newDate.setHours(inputDate.getHours() + 16)

            if (newDate > new Date()) {
                Toast.show({
                    type: 'error',
                    text1: 'Date of birth cannot be in the future!'
                })
            } else {
                let obj = {
                    user_id: user.user_id,
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    date_of_birth: newDate,
                    country_code: formData.countryCode,
                    mobile_num: formData.mobileNum,
                }
        
                try {
                    let response;
                    if (user.user_type === 'LOCAL') {
                        response = await editLocalProfile(obj);
                    } else if (user.user_type === 'TOURIST') {
                        response = await editTouristProfile(obj);
                    }
                    console.log(response.data);
        
                    if (response && response.status) {
                        console.log('edit profile success!');
                        Toast.show({
                            type: 'success',
                            text1: 'Edit Profile Successful!'
                        })

                        await SecureStore.setItemAsync(
                            TOKEN_KEY,
                            response.data.token
                        )
                        await storeUser(response.data.user)
                        authContext.setAuthState({
                            accessToken: response.data.token,
                            authenticated: true
                        });

                        navigation.navigate('ViewProfileScreen')
                    } else {
                        console.log('edit profile failed!');
                        Toast.show({
                            type: 'error',
                            text1: response.data.errorMessage
                        })
                    }
                } catch (error) {
                    console.log(error)
                    alert('An error hass occurred' + error);
                }
            }
        } else if (InputValidator.dob(inputDate) !== '') {
            Toast.show({
                type: 'error',
                text1: 'Please select a valid date!',
            })
        }
    }

    return user ? (
        <Background>
            <Header>
                Edit Profile
            </Header>
            
            <ScrollView automaticallyAdjustKeyboardInsets={true}>
                <TextInput
                    label="Name"
                    returnKeyType="next"
                    style={{minWidth: '100%'}}
                    value={formData.name}
                    onChangeText={(name) => setFormData({...formData, name})}
                    errorText={InputValidator.name(formData.name)}
                />
                <TextInput
                    label="Email"
                    returnKeyType="next"
                    style={{minWidth: '100%'}}
                    value={formData.email}
                    onChangeText={(email) => setFormData({...formData, email})}
                    errorText={InputValidator.email(formData.email)}
                />

                <View style={{marginTop: 30, marginBottom: 30}}>
                    <DatePickerInput
                        locale="en"
                        label="Date of Birth"
                        value={inputDate}
                        onChange={(d) => setInputDate(d)}
                        inputMode="start"
                    />
                </View>

                <TextInput
                    label="Country Code"
                    returnKeyType="next"
                    value={formData.countryCode}
                    style={{minWidth: '100%'}}
                    onChangeText={(countryCode) => setFormData({...formData, countryCode})}
                    errorText={InputValidator.countryCode(formData.countryCode)}
                />

                <TextInput
                    label="Mobile Number"
                    returnKeyType="next"
                    style={{minWidth: '100%'}}
                    value={formData.mobileNum}
                    onChangeText={(mobileNum) => setFormData({...formData, mobileNum})}
                    errorText={InputValidator.mobileNo(formData.mobileNum)}
                />

                <TextInput
                    label="Password (Validation)"
                    returnKeyType="next"
                    style={{minWidth: '100%'}}
                    value={formData.password}
                    secureTextEntry={true}
                    onChangeText={(password) => setFormData({...formData, password})}
                    errorText={InputValidator.password(formData.password)}
                />

                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Button
                        mode="contained"
                        text={"Submit"}
                        onPress={onEditProfilePressed}
                    />
                </View>
            </ScrollView>
        </Background>
    ) : (<Background></Background>)
}