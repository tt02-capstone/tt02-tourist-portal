import React, {useEffect, useState} from 'react'
import {StyleSheet } from 'react-native'
import { useRoute } from '@react-navigation/native';
import Button from '../../components/Button'
import TextInput from '../../components/TextInput'
import { Provider, Surface, ThemeProvider, } from "react-native-paper";
import { getUser } from '../../helpers/LocalStorage';
import Toast from "react-native-toast-message";
import InputValidator from "../../helpers/InputValidator";
import { reportPost } from '../../redux/reportRedux';
import DropDown from "react-native-paper-dropdown";

export const ReportPostScreen = ({navigation}) => {

    const [user, setUser] = useState('');
    const route = useRoute();
    const { catId, postId } = route.params;
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

    const reasonTypeList = [
        {
          label: "Offensive Behaviour",
          value: "OFFENSIVE_BEHAVIOUR",
        },
        {
          label: "Inappropriate Content",
          value: "INAPPROPRIATE_CONTENT",
        },
        {
          label: "Others",
          value: "OTHER",
        },
      ];

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
        <Provider>
            <ThemeProvider>
                <Surface style={styles.containerStyle}>
                    <DropDown
                        label={"Reason"}
                        mode={"outlined"}
                        visible={showDropDown}
                        showDropDown={() => setShowDropDown(true)}
                        onDismiss={() => setShowDropDown(false)}
                        value={formData.reason_type}
                        dropDownStyle={{marginTop: -42}}
                        setValue={(reason_type) => setFormData({...formData, reason_type})}
                        list={reasonTypeList}
                    />
                </Surface>

                <TextInput
                style={{marginLeft: 20, width: 350, height: 280, marginTop: -200, marginBottom: 10 }}
                label="Reason"
                multiline={true}
                returnKeyType="next"
                value={formData.content}
                onChangeText={(content) => setFormData({...formData, content})}
                errorText={formData.content ? InputValidator.text(formData.content) : ''}
            />
            </ThemeProvider>

            <Button
                style={{marginLeft: 20, width: 350, marginBottom: 300 }}
                mode="contained"
                text={"Report"}
                onPress={onReportPressed}
            />
        </Provider>
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