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
import {touristApi} from "../helpers/api";
import CustomButton from "../components/CustomButton";
import {ProgressBar, MD3Colors} from 'react-native-paper';
import {FormContext, FormProvider} from '../helpers/FormProvider'
import {validate} from "@babel/core/lib/config/validation/options";

export const SignUpScreen = ({navigation}) => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [isLocal, setIsLocal] = useState('');
    const [progress, setProgress] = React.useState(0.5);
    const [page, setPage] = React.useState(0);
    const onSignUpPressed = () => {

        const nameError = InputValidator.name(name)
        const emailError = InputValidator.email(email)
        const passwordError = InputValidator.password(password)
        if (emailError || passwordError || nameError) {
            return
        }

        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'HomeScreen' }],
        // })
    }

    return (<Background>
        <View>
            <Paragraph>Default ProgressBar </Paragraph>
            <ProgressBar progress={progress} visible={true}/>
        </View>
        <TextInput
            label="Name"
            returnKeyType="next"
            value={name}
            onChangeText={(text) => setName(text)}
            // error={!!name.error}
            errorText={InputValidator.name(name)}
        />
        <TextInput
            label="Email"
            returnKeyType="next"
            value={email}
            onChangeText={(text) => setEmail(text)}
            // error={!!email.error}
            errorText={InputValidator.email(email)}
            autoCapitalize="none"
            autoCompleteType="email"
            textContentType="emailAddress"
            keyboardType="email-address"
        />
        <TextInput
            label="Password"
            returnKeyType="done"
            value={password}
            onChangeText={(text) => setPassword(text)}
            // error={!!password.error}
            errorText={InputValidator.password(password)}
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
        {page < 3 && (<Button
            text={"Next"}
            onPress={() => {
                setPage(page + 1);
            }}
        />)}
        {/*{page === 2 && isLocal === 'Yes' && (*/}


        {/*)}*/}
    </Background>)

}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row', marginTop: 4,
    }, link: {
        fontWeight: 'bold', color: theme.colors.primary,
    },
})