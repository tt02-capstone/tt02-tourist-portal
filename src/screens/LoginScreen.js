import React, {useContext, useState} from 'react'
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
import {localApi, touristApi, userApi} from "../helpers/api";
import CustomButton from "../components/CustomButton";
import {storeUser} from "../helpers/LocalStorage";
import {AuthContext, TOKEN_KEY} from "../helpers/AuthContext";
import * as SecureStore from 'expo-secure-store';

export const LoginScreen = ({navigation}) => {
    const authContext = useContext(AuthContext);
    const [email, setEmail] = useState({value: '', error: ''})
    const [password, setPassword] = useState({value: '', error: ''})

    const onLoginPressed = async () => {
        const emailError = InputValidator.email(email.value)
        if (emailError) {
            setEmail({...email, error: emailError})
            return
        }
        console.log('heree')

        try {
            const response = await userApi.post(`/mobileLogin/${email.value}/${password.value}`)
            console.log("here")
            if (
                response.data.httpStatusCode === 400 ||
                response.data.httpStatusCode === 404 ||
                response.data.httpStatusCode === 422
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
                console.log('response.data.token', response.data.token)

                await SecureStore.setItemAsync(
                    TOKEN_KEY,
                    response.data.token
                )

                await storeUser(response.data.user)

                authContext.setAuthState({
                    authenticated: true
                });
            }
        } catch (error) {
            alert('An error has occurred' + error)
        }
    }

    return (
        <Background >
            <View style={{alignItems: 'center'}}>
            <Header>WithinSG</Header>
            <TextInput
                label="Email"
                value={email.value}
                onChangeText={(text) => setEmail({value: text, error: ''})}
                error={!!email.error}
                errorText={email.error}
                autoCapitalize="none"
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
            </View>
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

