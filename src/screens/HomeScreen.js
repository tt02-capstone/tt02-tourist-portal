import React from 'react'
import Background from '../components/Background'
import Header from '../components/Header'
import Button from '../components/Button'

export const HomeScreen = ({navigation}) => {
    return (
        <Background>
            <Header>Home Screen</Header>
            <Button
                text="Logout"
                mode="contained"
                onPress={() =>
                    navigation.reset({
                        index: 0,
                        routes: [{name: 'LoginScreen'}],
                    })
                }
            />
        </Background>
    )
}