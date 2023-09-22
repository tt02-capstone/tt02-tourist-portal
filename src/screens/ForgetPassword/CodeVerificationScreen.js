import React, {useState} from 'react'
import Background from '../../components/Background'
import Header from '../../components/Header'
import TextInput from '../../components/TextInput'
import Button from '../../components/Button'
import InputValidator from '../../helpers/InputValidator'
import CustomButton from "../../components/CustomButton";
import {localApi, userApi} from "../../helpers/api";
import Toast from "react-native-toast-message";
import {ActivityIndicator, Paragraph} from "react-native-paper";

export const CodeVerificationScreen = ({navigation}) => {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const verifyCode = async () => {
        setLoading(true);

        try {
            const response = await userApi.post(`/passwordResetStageTwo/${code}`)

            if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
                setLoading(false);
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'Code Verified!'
                })
                setLoading(false);
                setTimeout(() => {
                    navigation.navigate('ResetPasswordScreen', {
                        verificationCode: code
                    })
                }, 2000);
            }
        } catch (error) {
            console.error("Axios Error : ", error)
            setLoading(false);
        }
    }

    return (
        <Background>
            <Header>Verify WithinSG code</Header>
            <Paragraph>Key in the code send to your email.</Paragraph>
            <ActivityIndicator size="large" animating={loading}/>
            <TextInput
                label="Verification Code"
                value={code}
                onChangeText={(text) => setCode(text)}
                secureTextEntry
            />
            <Button
                text="Verify"
                // viewStyle={{ marginTop: 16 }}
                mode="contained"
                onPress={verifyCode}
            />
        </Background>
    )
}