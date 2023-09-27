import React from 'react'
import { StyleSheet, KeyboardAvoidingView, View } from 'react-native'
import { theme } from '../core/theme'

const Background = ({ children }) => {
  return (
    <View style={styles.background}>
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
  },
  container: {
    flex: 1,
    padding: 10,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    position: 'absolute',
    // alignItems: 'center',
    justifyContent: 'center',
  },
})

export default Background
