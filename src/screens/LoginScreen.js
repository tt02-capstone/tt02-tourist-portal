import React, { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Background from '../components/Background'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { theme } from '../core/theme'
import InputValidator from "../helpers/InputValidator";
import CustomButton from "../components/CustomButton";
import { loginUser } from '../redux/login'
import Toast from "react-native-toast-message";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })

  const onLoginPressed = () => {
    const emailError = InputValidator.emailValidator(email.value)
    const passwordError = InputValidator.passwordValidator(password.value)

    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError })
      setPassword({ ...password, error: passwordError })
      return
    }

    try {
      let touristLogin = loginUser(email,password)
      console.log(touristLogin)
      if (touristLogin) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeScreen' }],
        });
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
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
      />
      <TextInput
        label="Password"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <CustomButton
          text = "Forgot your password?"
          viewStyle={styles.forgotPassword}
          textStyle={styles.forgot}
          onPress={() => console.log('ResetPasswordScreen')}
      />
      <Button text = "Login" mode="contained" onPress={onLoginPressed}/>
      <CustomButton
          text = "Sign up"
          viewStyle={styles.row}
          textStyle={styles.link}
          onPress={() => console.log('RegisterScreen')}
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

export default LoginScreen