import React, {useEffect, useState} from 'react'
import {StyleSheet, View } from 'react-native'
import { useRoute } from '@react-navigation/native';
import Button from '../../components/Button'
import TextInput from '../../components/TextInput'
import Background from '../../components/CardBackground'
import RNPickerSelect from 'react-native-picker-select';
import { getUser } from '../../helpers/LocalStorage';
import Toast from "react-native-toast-message";
import InputValidator from "../../helpers/InputValidator";
import { theme } from '../../core/theme'
import { reportPost } from '../../redux/reportRedux';

export const ReportPostScreen = ({navigation}) => {

    const [user, setUser] = useState('');
    const route = useRoute();
    const { catId, postId } = route.params;

    const [formData, setFormData] = useState({ // form input fields
        content: '',
        reason_type: '',
    })

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        fetchUser();
    }, []);

    const onReportPressed = async () => {
        if (!formData.reason_type) {
            Toast.show({
                type: 'error',
                text1: 'Reason Category cannot be empty!'
            })
        } else if (!formData.content) {
            Toast.show({
                type: 'error',
                text1: 'Reason cannot be empty!'
            })
        } else {
            let report = {
                reason_type: formData.reason_type,
                content: formData.content,
                creation_date: new Date(),
            }

            const response = await reportPost(postId, report);
            if (response.status) {
                console.log('success');
                Toast.show({
                    type: 'success',
                    text1: 'Report made!'
                })
    
                navigation.navigate('PostScreen', { postId: postId, catId: catId });
            } else {
                console.log('error')
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
            }
        }
    }

    return (
        <Background style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={{marginTop: 50}}>
                <RNPickerSelect
                    placeholder={{
                        label: 'Reason',
                        value: null,
                    }}
                    onValueChange={(value) => setFormData({ ...formData, reason_type: value })}
                    items={[
                        { label: 'Offensive Behaviour', value: 'OFFENSIVE_BEHAVIOUR' },
                        { label: 'Inappropriate Content', value: 'INAPPROPRIATE_CONTENT' },
                        { label: 'Others', value: 'OTHER' },
                    ]}
                    value={formData.reason_type}
                    style={pickerSelectStyles}
                />
            </View>

            <TextInput
                style={{marginLeft: 0, width: 370, height: 250 }}
                label="Please describe in detail"
                multiline={true}
                returnKeyType="next"
                value={formData.content}
                onChangeText={(content) => setFormData({...formData, content})}
                errorText={formData.content ? InputValidator.text(formData.content) : ''}
            />

            <Button
                style={{marginLeft: 10, width: 350, marginBottom: 300 }}
                mode="contained"
                text={"Report"}
                onPress={onReportPressed}
            />
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
    description: {
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