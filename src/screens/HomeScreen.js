import React, {useEffect, useState} from 'react'
import Background from '../components/Background'
import Header from '../components/Header'
import Button from '../components/Button'
import {clearStorage, getUser, getUserType} from "../helpers/LocalStorage";
import {Paragraph} from "react-native-paper";
import {loggedUserApi} from "../helpers/api";

export const HomeScreen = ({navigation}) => {
    const [userData, setUserData] = useState('')

    useEffect(() => {
        async function fetchData() {
            const userData = await getUser()
            setUserData(userData)
            const usertype =  await getUserType()
            console.log(usertype)
            console.log(loggedUserApi(usertype))
        }

        fetchData();
    }, [])

    const onLogoutPressed = async () => {
        await clearStorage();

        navigation.reset({
            index: 0,
            routes: [{name: 'LoginScreen'}],
        })
    }

    return (
        <Background>
            <Header>Home Screen</Header>
            <Paragraph>Welcome {userData.name}</Paragraph>
            <Button
                text="Logout"
                mode="contained"
                onPress={onLogoutPressed}
            />
        </Background>
    )
}