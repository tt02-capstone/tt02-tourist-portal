import React, {useState} from 'react'
import Background from '../components/Background'
import Header from '../components/Header'
import TextInput from '../components/TextInput'
import Button from '../components/Button'
import InputValidator from '../helpers/InputValidator'
import CustomButton from "../components/CustomButton";

export const ResetPasswordScreen = ({navigation}) => {
    const [email, setEmail] = useState({value: '', error: ''})

    const sendResetPasswordEmail = () => {
        const emailError = InputValidator.email(email.value)
        if (emailError) {
            setEmail({...email, error: emailError})
            return
        }
        navigation.navigate('LoginScreen')
    }

    return (
        <Background>
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
                onPress={sendResetPasswordEmail}
            />
        </Background>
    )
}

