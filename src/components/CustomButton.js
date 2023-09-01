import React from 'react'
import {Pressable, Text, View} from 'react-native'

const CustomButton = ({ text, viewStyle, textStyle, onPress }) => {
    return (
        <View style={viewStyle}>
            <Pressable
                onPress={onPress}
            >
                <Text style={textStyle}>{text}</Text>
            </Pressable>
        </View>
    )
}

export default CustomButton
