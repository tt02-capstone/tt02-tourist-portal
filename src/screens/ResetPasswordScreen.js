import React, {useState} from 'react'
import Background from '../components/Background'
import Header from '../components/Header'
import TextInput from '../components/TextInput'
import Button from '../components/Button'
import InputValidator from '../helpers/InputValidator'
import CustomButton from "../components/CustomButton";
import {localApi} from "../helpers/api";
import Toast from "react-native-toast-message";
import {ActivityIndicator, Paragraph} from "react-native-paper";

export const ResetPasswordScreen = ({navigation}) => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const sendResetPassword = () => {
        setLoading(true);

        try {
            const response = localApi.post(`/passwordResetStageTwo/${new URLSearchParams(document.location.search)
                .get('token')}/${password}`)

            if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
                setLoading(false);
            } else {
                Toast.show({
                    type: 'Password changed successfully.',
                    position: Toast.POSITION.TOP_RIGHT,
                    text1: response.data.errorMessage
                })
                setLoading(false);
                setTimeout(() => {
                    navigation.reset({
                        index: 0,
                        routes: [{name: 'LoginScreen'}],
                    })
                }, 2000);
            }
        } catch (error) {
            console.error("Axios Error : ", error)
        }
    }

    return (
        <Background>
            <Header>Reset WithinSG account password</Header>
            <Paragraph>Key in the new password that you would like to change to.</Paragraph>
            <ActivityIndicator size="large" animating={loading}/>
            <TextInput
                label="Password"
                value={password.value}
                onChangeText={(text) => setPassword(text)}
                errorText={InputValidator.password(password)}
                secureTextEntry
            />
            <TextInput
                label="Confirm Password"
                value={confirmPassword.value}
                onChangeText={(text) => setPassword(text)}
                errorText={InputValidator.confirmPassword(password, confirmPassword)}
                secureTextEntry
            />
            <Button
                text="Reset Password"
                // viewStyle={{ marginTop: 16 }}
                mode="contained"
                onPress={sendResetPassword}
            />
        </Background>
    )
}