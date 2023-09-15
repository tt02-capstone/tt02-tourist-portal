import React, {useState, useEffect} from 'react';
import Background from '../../components/Background';
import Header from '../../components/Header';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import InputValidator from '../../helpers/InputValidator';
import Toast from "react-native-toast-message";
import { View } from 'react-native';
import { editPassword } from '../../redux/userRedux';
import { getUser } from '../../helpers/LocalStorage';
import { useIsFocused } from '@react-navigation/core';

export const EditPasswordScreen = ({route, navigation}) => {

    const isFocused = useIsFocused();
    const [user, setUser] = useState();

    useEffect(() => {
        async function fetchData() {
            console.log("edit password");
            const userData = await getUser()
            setUser(userData)
        }

        if (isFocused) {
            fetchData();   
        }

    }, [isFocused])

    const [formData, setFormData] = useState({
        oldPassword: "",
        newPasswordOne: "",
        newPasswordTwo: "",
    })

    const onSubmitPressed = async () => {
        try {
            let response = await editPassword(user.user_id, formData.oldPassword, formData.newPasswordOne);
            if (response && response.status) {
                console.log('password edit success!');
                Toast.show({
                    type: 'success',
                    text1: 'Password Successful Changed!'
                })
                navigation.navigate('ViewProfileScreen')
            } else {
                console.log('password edit failed!');
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

    return user ? (
        <Background>
            <Header>
                Edit Password
            </Header>
            
            <View>
                <TextInput
                    label="Old Password"
                    returnKeyType="next"
                    value={formData.oldPassword}
                    onChangeText={(oldPassword) => setFormData({...formData, oldPassword})}
                />

                <TextInput
                    label="New Password"
                    returnKeyType="next"
                    value={formData.newPasswordOne}
                    onChangeText={(newPasswordOne) => setFormData({...formData, newPasswordOne})}
                    errorText={InputValidator.password(formData.newPasswordOne)}
                />

                <TextInput
                    label="Repeat New Password"
                    returnKeyType="next"
                    value={formData.newPasswordTwo}
                    onChangeText={(newPasswordTwo) => setFormData({...formData, newPasswordTwo})}
                    errorText={InputValidator.confirmPassword(formData.newPasswordOne, formData.newPasswordTwo)}
                />

                <Button
                    mode="contained"
                    text={"Submit"}
                    onPress={onSubmitPressed}
                />

                <Button
                    mode="contained"
                    text={"Cancel"}
                    onPress={() => navigation.navigate('ViewProfileScreen')}
                />
            </View>
        </Background>
    ) : (<div></div>)
}