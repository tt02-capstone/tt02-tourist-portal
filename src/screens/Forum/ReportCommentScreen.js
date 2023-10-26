import React, {useEffect, useState} from 'react';
import {StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import { theme } from '../../core/theme';
import Background from '../../components/CardBackground';
import RNPickerSelect from 'react-native-picker-select';
import { getUser } from '../../helpers/LocalStorage';
import Toast from "react-native-toast-message";
import InputValidator from "../../helpers/InputValidator";
import { reportComment } from '../../redux/reportRedux';

export const ReportCommentScreen = ({navigation}) => {

    const [user, setUser] = useState('');
    const route = useRoute();
    const { catId, postId, commentId } = route.params;
    const [showDropDown, setShowDropDown] = useState(false); // dropdown boolean

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

            const response = await reportComment(commentId, report);
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
                style={{marginLeft: 20, width: 350, marginBottom: 300 }}
                mode="contained"
                text={"Report"}
                onPress={onReportPressed}
            />
        </Background>
    )
}

const styles = StyleSheet.create({
    containerStyle: {
      flex: 1,
      marginLeft: 20,
      marginRight: 20,
      marginTop: 20,
      width: 350,
    },
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