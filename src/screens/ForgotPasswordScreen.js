import React, {useState} from 'react'
import Background from '../components/Background'
import Header from '../components/Header'
import TextInput from '../components/TextInput'
import Button from '../components/Button'
import InputValidator from '../helpers/InputValidator'
import Toast from "react-native-toast-message";
import {localApi, touristApi, userApi} from "../helpers/api";
import {ActivityIndicator} from "react-native-paper";

export const ForgotPasswordScreen = ({navigation}) => {
    const [email, setEmail] = useState({value: '', error: ''})
    const [loading, setLoading] = useState(false)

    const sendForgotPasswordEmail = async () => {
        const emailError = InputValidator.email(email.value)
        if (emailError) {
            setEmail({...email, error: emailError})
        }

        setLoading(true);
        try {
            const response = await userApi.post(`/passwordResetStageOne/${email.value}`)
            console.log(response);
            if (response.data.status === 400 || response.data.status === 404) {
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
                setLoading(false);
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'Please check your email for the instructions to reset your password.'
                })
                setLoading(false);
                navigation.navigate('CodeVerificationScreen')
            }
        } catch (error) {
            console.error("Axios Error : ", error)
        }
        // navigation.navigate('LoginScreen')
    }

    return (
        <Background>
            <ActivityIndicator size="large" animating={loading}/>
                <Header>Have you forgotten your WithinSG account password?</Header>
                <TextInput
                    label="E-mail address"
                    returnKeyType="done"
                    value={email.value}
                    onChangeText={(text) => setEmail({value: text, error: ''})}
                    error={!!email.error}
                    errorText={email.error}
                    autoCapitalize="none"
                    autoCompleteType="email"
                    textContentType="emailAddress"
                    keyboardType="email-address"
                    description="You will receive email with password reset link."
                />
                <Button
                    text="Send Instructions"
                    // viewStyle={{ marginTop: 16 }}
                    mode="contained"
                    onPress={sendForgotPasswordEmail}
                />
        </Background>
    )
}