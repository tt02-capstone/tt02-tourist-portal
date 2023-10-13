import React, {useContext, useEffect, useState} from 'react'
import {Pressable, StyleSheet, Switch, TextComponent, View} from 'react-native'
import {List, Paragraph, RadioButton, Text, ToggleButton} from 'react-native-paper'
import { useRoute } from '@react-navigation/native';
import Background from '../../components/Background'
import Header from '../../components/Header'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput'
import {theme} from '../../core/theme'
import { getUser } from '../../helpers/LocalStorage';
import Toast from "react-native-toast-message";
import InputValidator from "../../helpers/InputValidator";
import CustomButton from "../../components/CustomButton";

export const UpdatePostScreen = ({navigation}) => {

    const [user, setUser] = useState('');
    const route = useRoute();
    const { id } = route.params; // category id

    const [formData, setFormData] = useState({ // form input fields
        title: "",
        content: "",
        image_list: [],
    })

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        fetchUser();
    }, []);

    const onUpdatePressed = async () => {

    }

    return (
        <Background>
            <View>
                <Text>Update Post</Text>
            </View>
        </Background>
    )
}