import React, {useState, useEffect} from 'react'
import Background from '../../components/Background'
import Header from '../../components/Header'
import TextInput from '../../components/TextInput'
import Button from '../../components/Button'
import InputValidator from '../../helpers/InputValidator'
import Toast from "react-native-toast-message";
import { View } from 'react-native';
import { getUser } from '../../helpers/LocalStorage'
import { DatePickerInput } from 'react-native-paper-dates';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { editLocalProfile } from '../../redux/localRedux';
import { editTouristProfile } from '../../redux/touristRedux';
import { storeUser } from '../../helpers/LocalStorage';

export const EditProfileScreen = ({route, navigation}) => {

    const [user, setUser] = useState();
    const [inputDate, setInputDate] = React.useState();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        countryCode: "",
        mobileNum: "",
    })

    useEffect(() => {
        async function fetchData() {
            const userData = await getUser()
            setUser(userData);
            setInputDate(new Date(userData.date_of_birth));
            setFormData({
                name: userData.name,
                email: userData.email,
                countryCode: userData.country_code,
                mobileNum: userData.mobile_num,
            })
        }

        fetchData();
    }, [])

    const onEditProfilePressed = async () => {
        console.log(inputDate);
        let obj = {
            user_id: user.user_id,
            name: formData.name,
            email: formData.email,
            date_of_birth: inputDate,
            country_code: formData.countryCode,
            mobile_num: formData.mobileNum,
        }

        try {
            let response;
            if (user.user_type === 'LOCAL') {
                response = await editLocalProfile(obj);
            } else if (user.user_type === 'TOURIST') {
                response = await editTouristProfile(obj);
            }

            if (response && response.status) {
                console.log('edit profile success!');
                Toast.show({
                    type: 'success',
                    text1: 'Edit Profile Successful!'
                })
                await storeUser(response.data);
                navigation.navigate('ViewProfileScreen')
            } else {
                console.log('edit profile failed!');
                Toast.show({
                    type: 'error',
                    text1: response.data.errorMessage
                })
            }
        } catch (error) {
            console.log(error)
            alert('An error hass occurred' + error);
        }
    }

    return user ? (
        <Background>
            <Header>
                Edit Profile
            </Header>
            
            <View>
                <TextInput
                    label="Name"
                    returnKeyType="next"
                    value={formData.name}
                    onChangeText={(name) => setFormData({...formData, name})}
                    errorText={InputValidator.name(formData.name)}
                />
                <TextInput
                    label="Email"
                    returnKeyType="next"
                    value={formData.email}
                    onChangeText={(email) => setFormData({...formData, email})}
                    errorText={InputValidator.email(formData.email)}
                />

                <SafeAreaProvider>
                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                        <DatePickerInput
                        locale="en"
                        label="Date of Birth"
                        value={inputDate}
                        onChange={(d) => setInputDate(d)}
                        inputMode="start"
                        />
                    </View>
                </SafeAreaProvider>

                <TextInput
                    label="Country Code"
                    returnKeyType="next"
                    value={formData.countryCode}
                    onChangeText={(countryCode) => setFormData({...formData, countryCode})}
                    errorText={InputValidator.countryCode(formData.countryCode)}
                />

                <TextInput
                    label="Mobile Number"
                    returnKeyType="next"
                    value={formData.mobileNum}
                    onChangeText={(mobileNum) => setFormData({...formData, mobileNum})}
                    errorText={InputValidator.mobileNo(formData.mobileNum)}
                />

                <Button
                    mode="contained"
                    text={"Submit"}
                    onPress={onEditProfilePressed}
                />

                <Button
                    mode="contained"
                    text={"Cancel"}
                    onPress={() => navigation.navigate('ViewProfileScreen')}
                />
            </View>
        </Background>
    ) : (<div></div>)
}