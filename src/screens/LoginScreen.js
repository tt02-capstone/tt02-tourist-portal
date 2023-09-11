import React, {useState} from 'react'
import {Pressable, StyleSheet, View} from 'react-native'
import {Text} from 'react-native-paper'
import axios from 'axios'
import Background from '../components/Background'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import {theme} from '../core/theme'
import Toast from "react-native-toast-message";
import InputValidator from "../helpers/InputValidator";
import {touristApi} from "../helpers/api";
import CustomButton from "../components/CustomButton";

export const LoginScreen = ({navigation}) => {
    const [email, setEmail] = useState({value: '', error: ''})
    const [password, setPassword] = useState({value: '', error: ''})

    const onLoginPressed = async () => {
        const emailError = InputValidator.email(email.value)
        const passwordError = InputValidator.password(password.value)
        if (emailError || passwordError) {
            setEmail({...email, error: emailError})
            setPassword({...password, error: passwordError})
            return
        }

        try {
            const response = await touristApi.post(`/login/${email.value}/${password.value}`)
            if (
                response.data.httpStatusCode === 400 ||
                response.data.httpStatusCode === 404
            ) {
                console.log('error')
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'Login Successful'
                })

                console.log('success', response.data)
                navigation.reset({
                    index: 0,
                    routes: [{name: 'HomeScreen'}],
                })
            }
        } catch (error) {
            alert('An error hass occurred' + error)
        }
    }

    return (
        <Background>
            <Header>Travel Planning App</Header>
            <TextInput
                label="Email"
                value={email.value}
                onChangeText={(text) => setEmail({value: text, error: ''})}
                error={!!email.error}
                errorText={email.error}
            />
            <TextInput
                label="Password"
                value={password.value}
                onChangeText={(text) => setPassword({value: text, error: ''})}
                error={!!password.error}
                errorText={password.error}
                secureTextEntry
            />
            <CustomButton
                text="Forgot your password?"
                viewStyle={styles.forgotPassword}
                textStyle={styles.forgot}
                onPress={() => navigation.navigate('ForgotPasswordScreen')}
            />
            <Button text="Login" mode="contained" onPress={onLoginPressed}/>
            <CustomButton
                text="Sign up"
                viewStyle={styles.row}
                textStyle={styles.link}
                onPress={() => navigation.navigate('SignUpScreen')}
            />
        </Background>
    )
}

const styles = StyleSheet.create({
    forgotPassword: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        marginTop: 4,
    },
    forgot: {
        fontSize: 13,
        color: theme.colors.secondary,
    },
    link: {
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
})

