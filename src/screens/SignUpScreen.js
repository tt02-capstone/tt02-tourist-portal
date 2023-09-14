import React, {useContext, useState} from 'react'
import {Pressable, StyleSheet, TextComponent, View} from 'react-native'
import {List, Paragraph, RadioButton, Text} from 'react-native-paper'
import axios from 'axios'
import Background from '../components/Background'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import {theme} from '../core/theme'
import Toast from "react-native-toast-message";
import InputValidator from "../helpers/InputValidator";
import {localApi, touristApi} from "../helpers/api";
import CustomButton from "../components/CustomButton";
import {ProgressBar, MD3Colors} from 'react-native-paper';
import {LocalForm} from "../helpers/LocalForm";
// import {CountryPicker} from "react-native-country-codes-picker";
// import CountryPicker from 'react-native-country-picker-modal';
import {ForeignerForm} from "../helpers/ForeignerForm";

export const SignUpScreen = ({navigation}) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        dob: new Date(),
        mobile: "",
        nric: "",
        passport: "",
        countryCode: ""
    })

    const [isLocal, setIsLocal] = useState('');
    const [progress, setProgress] = React.useState(0.5);
    const [page, setPage] = React.useState(1);
    const [show, setShow] = useState(false);

    const onPage1Pressed = () => {
        const nameError = InputValidator.name(formData.name)
        const emailError = InputValidator.email(formData.email)
        const passwordError = InputValidator.password(formData.password)
        if (emailError || passwordError || nameError || !isLocal) {
            return
        }
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
                        // error={!!name.error}
                        errorText={InputValidator.name(formData.name)}
                    />
                    <TextInput
                        label="Email"
                        returnKeyType="next"
                        value={formData.email}
                        onChangeText={(email) => setFormData({...formData, email})}
                        // error={!!email.error}
                        errorText={InputValidator.email(formData.email)}
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
                        errorText={InputValidator.password(formData.password)}
                        secureTextEntry
                    />
                    <Text>Are you a Singapore Citizen, PR or Long Term Pass Holder </Text>
                    <View style={{flexDirection: 'row', width: '100%'}}>
                        <RadioButton.Group
                            value={isLocal}
                            onValueChange={(value) => setIsLocal(value)}
                            style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}
                        >
                            <RadioButton.Item label="Yes" value="Yes"/>
                            <RadioButton.Item label="No" value="No"/>
                        </RadioButton.Group>
                    </View>
                </View>)
        } else if (page == 2) {
            if (isLocal === 'Yes') {
                return <LocalForm formData={formData} setFormData={setFormData}/>
            } else {
                return <ForeignerForm formData={formData} setFormData={setFormData}/>
            }
        }


    }
    const onSignUpPressed = async () => {
        setProgress(1)

        let user = isLocal === "Yes"? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            is_blocked: false,
            country_code: "65",
            nric_num: formData.nric,
            date_of_birth: "2001-03-08",
            mobile_num: formData.mobile,
            wallet_balance: 0
        }: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            is_blocked: false,
            country_code: "65",
            passport_num: formData.passport,
            date_of_birth: "2001-03-08",
            mobile_num: formData.mobile
        };
        console.log(user, isLocal)
        try {
            const response = isLocal === "Yes"? await localApi.post(`/create`,user ): await touristApi.post(`/create`,user )
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
                    text1: 'Sign Up Successful'
                })

                console.log('success', response.data)
                navigation.reset({
                    index: 0,
                    routes: [{name: 'LoginScreen'}],
                })
            }
        } catch (error) {
            console.log(error)
            alert('An error hass occurred' + error)
        }

        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'HomeScreen' }],
        // })
    }

    return (
        <Background>
            <View>
                <Paragraph> Progress - Part {page}</Paragraph>
                <ProgressBar progress={progress} visible={true}/>
            </View>
            <View>{PageDisplay()}</View>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                {page === 2 &&<Button
                    mode="contained"
                    text={"Prev"}
                    onPress={() => {
                        setPage(page - 1);
                    }}
                />}
                {page === 1 && <Button
                    mode="contained"
                    text={"Next"}
                    onPress={onPage1Pressed}
                />}
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