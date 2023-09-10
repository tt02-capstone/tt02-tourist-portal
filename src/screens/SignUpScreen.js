import React, { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import {Paragraph, Text} from 'react-native-paper'
import axios from 'axios'
import Background from '../components/Background'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { theme } from '../core/theme'
import Toast from "react-native-toast-message";
import InputValidator from "../helpers/InputValidator";
import {touristApi} from "../helpers/api";
import CustomButton from "../components/CustomButton";
import { ProgressBar, MD3Colors } from 'react-native-paper';

export const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState({ value: '', error: '' })
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  const [progress, setProgress] = React.useState(0.3);
  const onSignUpPressed = () => {

    const nameError = InputValidator.name(name.value)
    const emailError = InputValidator.email(email.value)
    const passwordError = InputValidator.password(password.value)
    if (emailError || passwordError || nameError) {
      setName({ ...name, error: nameError })
      setEmail({ ...email, error: emailError })
      setPassword({ ...password, error: passwordError })
      return
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    })
  }

  return (
      <Background>
          <View>
              <Paragraph>Default ProgressBar </Paragraph>
              <ProgressBar progress={progress} visible={true} />
          </View>
        <TextInput
            label="Name"
            returnKeyType="next"
            value={name.value}
            onChangeText={(text) => setName({ value: text, error: '' })}
            error={!!name.error}
            errorText={name.error}
        />
        <TextInput
            label="Email"
            returnKeyType="next"
            value={email.value}
            onChangeText={(text) => setEmail({ value: text, error: '' })}
            error={!!email.error}
            errorText={email.error}
            autoCapitalize="none"
            autoCompleteType="email"
            textContentType="emailAddress"
            keyboardType="email-address"
        />
        <TextInput
            label="Password"
            returnKeyType="done"
            value={password.value}
            onChangeText={(text) => setPassword({ value: text, error: '' })}
            error={!!password.error}
            errorText={password.error}
            secureTextEntry
        />
        <Button
            text = "Sign Up"
            mode="contained"
            onPress={onSignUpPressed}
            style={{ marginTop: 24 }}
        />
          <View style={styles.row}>
          <Text>Already have an account? </Text>
          <Pressable onPress={() => navigation.replace('LoginScreen')}>
            <Text style={styles.link}>Login</Text>
          </Pressable>
        </View>
      </Background>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
})