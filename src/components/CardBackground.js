import React from 'react'
import { StyleSheet, KeyboardAvoidingView, View } from 'react-native'
import { theme } from '../core/theme'

const Background = ({ children, style }) => {
  return (
    <View style={[styles.background, style]}>
      {/* children = all the other components between the opening and closing component */}
      <View style={styles.container} behavior="padding">
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.surface,
  }
})

export default Background
