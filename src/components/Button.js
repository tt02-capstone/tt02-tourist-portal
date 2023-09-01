import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import { Button as PaperButton } from 'react-native-paper'
import { theme } from '../core/theme'

const Button = ({ text, mode, onPress, style,...props }) => {
  return (
        <PaperButton
          style={[
            styles.button,
            mode === 'outlined',
            style,
          ]}
          labelStyle={styles.text}
          mode={mode}
          onPress = {onPress}
          {...props}>
            <Text>{text}</Text>
        </PaperButton>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    marginVertical: 10,
    paddingVertical: 2,
    backgroundColor:  '#044537'
  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 26,
  },
})

export default Button
