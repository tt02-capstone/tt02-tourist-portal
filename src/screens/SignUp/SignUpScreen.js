import React, {useContext, useState} from 'react'
import {Pressable, StyleSheet, Switch, TextComponent, View} from 'react-native'
import {List, Paragraph, RadioButton, Text, ToggleButton} from 'react-native-paper'
import axios from 'axios'
import Background from '../../components/Background'
import Header from '../../components/Header'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput'
import {theme} from '../../core/theme'
import Toast from "react-native-toast-message";
import InputValidator from "../../helpers/InputValidator";
import {localApi, touristApi} from "../../helpers/api";
import CustomButton from "../../components/CustomButton";
import {ProgressBar, MD3Colors} from 'react-native-paper';
import {LocalForm} from "./LocalForm";
import {ForeignerForm} from "./ForeignerForm";

export const SignUpScreen = ({navigation}) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        dob: "",
        mobile: "",
        nric: "",
        passport: "",
        countryCode: "65"
    })

    const [isLocal, setIsLocal] = useState(false);
    const [progress, setProgress] = React.useState(0.5);
    const [page, setPage] = React.useState(1);

    const onPage1Pressed = () => {
        const nameError = InputValidator.name(formData.name)
        const emailError = InputValidator.email(formData.email)
        const passwordError = InputValidator.password(formData.password)
        if (emailError || passwordError || nameError) {
            Toast.show({
                type: 'error',
                text1: 'All inputs are required!'
            })
            return
        }
        console.log(isLocal)
        setPage(page + 1);
        setProgress(0.5)
    }

    const PageDisplay = () => {
        if (page === 1) {
            return (
                <View>
                    <TextInput
                        label="Name"
                        returnKeyType="next"
                        value={formData.name}
                        onChangeText={(name) => setFormData({...formData, name})}
                        errorText={formData.name ? InputValidator.name(formData.name) : ''}
                    />
                    <TextInput
                        label="Email"
                        returnKeyType="next"
                        value={formData.email}
                        onChangeText={(email) => setFormData({...formData, email})}
                        // error={!!email.error}
                        errorText={formData.email? InputValidator.email(formData.email) : ''}
                        autoCapitalize="none"
                        autoCompleteType="email"
                        textContentType="emailAddress"
                        keyboardType="email-address"
                    />
                    <TextInput
                        label="Password"
                        returnKeyType="done"
                        value={formData.password}
                        onChangeText={(password) => setFormData({...formData, password})}
                        // error={!!password.error}
                        errorText={formData.password? InputValidator.password(formData.password): ''}
                        secureTextEntry
                    />
                    <View style= {{ flexDirection: 'row', marginTop: 5, marginBottom:10}}>
                        <Text style={{flexShrink: 1, maxWidth: '80%', marginRight: 10 }} >Are you a Singapore Citizen, PR or Long Term Pass Holder ?</Text>
                        <Switch value={isLocal} onValueChange={() => setIsLocal(!isLocal)} />
                    </View>
                </View>)
        } else if (page === 2) {
            if (isLocal) {
                return <LocalForm formData={formData} setFormData={setFormData}/>
            } else {
                return <ForeignerForm formData={formData} setFormData={setFormData}/>
            }
        }


    }
    const onSignUpPressed = async () => {

        const nricError = InputValidator.nric(formData.nric)
        const passportError = InputValidator.passport(formData.passport)
        const mobileError = InputValidator.mobileNo(formData.mobile)
        const dobError = InputValidator.dob(formData.dob)
        if (isLocal && (nricError  || mobileError ||dobError)) {
            Toast.show({
                type: 'error',
                text1: 'All inputs are required!'
            })
            return
        } else if (!isLocal && (passportError|| mobileError ||dobError)) {
            Toast.show({
                type: 'error',
                text1: 'All inputs are required!'
            })
            return
        }

        setProgress(1)
        console.log(formData)
        let user = isLocal? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            is_blocked: false,
            country_code: formData.countryCode,
            nric_num: formData.nric,
            date_of_birth: formData.dob,
            mobile_num: formData.mobile,
            wallet_balance: 0
        }: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            is_blocked: false,
            country_code: formData.countryCode,
            passport_num: formData.passport,
            date_of_birth: formData.dob,
            mobile_num: formData.mobile
        };
        console.log(user, isLocal)
        try {
            const response = isLocal? await localApi.post(`/create`,user ): await touristApi.post(`/create`,user )
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
                console.log('success')
                Toast.show({
                    type: 'success',
                    text1: 'Sign Up Successful! Please check your email for verification code!'
                })

                console.log('success', response.data)
                setTimeout(() => {
                    navigation.reset({
                        index: 0,
                        routes: [{name: 'EmailVerificationScreen'}],
                    })
                }, 700);

            }
        } catch (error) {
            console.log(error)
            alert('An error has occurred' + error)
        }
    }

    return (
        <Background>
            <View>
                <Paragraph> Part {page}</Paragraph>
                <ProgressBar progress={progress} visible={true}/>
            </View>
            <View>{PageDisplay()}</View>
            <View style={{ flexDirection: 'row', maxWidth: '60%' }}>
                {page === 2 &&<Button
                    mode="contained"
                    text={"Prev"}
                    onPress={() => {
                        setPage(page - 1);
                    }}
                    style={{margin: 5}}
                />}

                {page === 1 && <View style={{width: 400}}>
                    <Button
                    mode="contained"
                    text={"Next"}
                    onPress={onPage1Pressed}
                />
                </View>
                }

                {page===2 && <Button
                    mode="contained"
                    text={"Submit"}
                    onPress={onSignUpPressed}
                />}
            </View>
        </Background>
    )

}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row', marginTop: 4,
    }, link: {
        fontWeight: 'bold', color: theme.colors.primary,
    },
})