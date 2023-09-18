import React, {useContext, useEffect, useState} from 'react'
import Background from '../components/Background'
import Header from '../components/Header'
import Button from '../components/Button'
import {clearStorage, getUser, getUserType} from "../helpers/LocalStorage";
import {Paragraph} from "react-native-paper";
import {localApi, loggedUserApi, touristApi, updateApiInstances} from "../helpers/api";
import {AuthContext} from "../helpers/AuthContext";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

export const HomeScreen = ({navigation}) => {
    const [userName, setUserName] = useState('')
    const authContext= useContext(AuthContext);

    useEffect(() => {
        const fetchData= async () => {
            updateApiInstances(authContext.getAccessToken())
            const userData = await getUser()
            setUserName(userData.name)
            console.log('home userdata', userData)
            const usertype = await getUserType()
            console.log('usertype', usertype)
            console.log(authContext.getAccessToken())

            try {
                // const res = await touristApi.get(`/getAllTourist`);

                const res = await loggedUserApi(usertype).get(`/getAllLocal`);
                console.log('axios response', res.data);
            } catch (error) {

                    console.error("Response Data:", error.response.data);
                    console.error("Status Code:", error.response.status);
            }
        }

        fetchData();
    }, [])

    const onProfileScreenPressed = () => {
        navigation.navigate('ViewProfileScreen');
    }

    const onLogoutPressed = async () => {
        await clearStorage();
        await authContext.logout();

        navigation.reset({
            index: 0,
            routes: [{name: 'LoginScreen'}],
        })
    }

    return (
        <Background>
            <Header>Home Screen</Header>
            <Paragraph>Welcome {userName}</Paragraph>
            <Button
                text="Profile"
                mode="contained"
                onPress={onProfileScreenPressed}
            />
            <Button
                text="Logout"
                mode="contained"
                onPress={onLogoutPressed}
            />
        </Background>
    )
}