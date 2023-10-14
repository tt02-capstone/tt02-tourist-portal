
import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import Header from '../../components/Header';
import TextInput from '../../components/TextInput';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, CheckBox, Tab, TabView } from '@rneui/themed';
import InputValidator from '../../helpers/InputValidator';
import { getReplyById, updateReply } from '../../redux/supportRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'

const EditReplyScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        message: '',
    });

    const route = useRoute();
    const { replyId, replySupportTicketId } = route.params;

    async function fetchUser() {
        const userData = await getUser();
        setUser(userData);

        const userType = await getUserType();
    }

    const fetchReply = async () => {
        console.log("replyId", replyId);
        try {
            let response = await getReplyById(replyId);
            console.log("response", response);
            setReply(response.data);
            setLoading(false);
            fetchUser();

            setValues({
                message: response.data.message,
            })
        } catch (error) {
            alert('An error occur! Failed to retrieve reply details!');
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReply();
    }, []);

    async function handleEdit() {

        let replyObj = {
            message: values.message,
        }

        console.log("replyObj", replyObj);
        console.log("replyId", replyId);

        let response = await updateReply(replyId, replyObj);
        console.log("response", response);
        if (response.status) {
            Toast.show({
                type: 'success',
                text1: 'Reply edited!'
            })

            navigation.reset({
                index: 3,
                routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'SupportTicketScreen' }, { name: 'SupportTicketDetailsScreen', params: { supportTicketId: replySupportTicketId } }],
            });

        } else {
            console.log("Reply edit failed!");
            console.log(response.data);
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }

    return (
        <Background>
            <Text style={styles.header}>
                Edit Support Ticket
            </Text>

            <View style={{ alignItems: 'center', minHeight: '100%' }}>
                <TextInput
                    style={styles.message}
                    label="Write your message here"
                    multiline={true}
                    value={values.message}
                    onChangeText={(message) => setValues({ ...values, message })}
                    errorText={values.message ? InputValidator.text(values.message) : ''}
                />
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Button
                        mode="contained"
                        text={"Submit"}
                        onPress={handleEdit}
                    />
                </View>
            </View>
        </Background>
    )
}

const styles = StyleSheet.create({
    tag: {
        color: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        margin: 5,
        width: 90,
        fontSize: 10,
        fontWeight: 'bold'
    },
    boldText: {
        fontWeight: 'bold',
    },
    header: {
        fontSize: 21,
        color: theme.colors.primary,
        fontWeight: 'bold',
        paddingVertical: 12,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10
    },
    message: {
        width: 320,
        height: 200,
        marginTop: -15,
        textAlignVertical: 'top'
    }
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30,
        marginBottom: 15,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
    },
});

export default EditReplyScreen
