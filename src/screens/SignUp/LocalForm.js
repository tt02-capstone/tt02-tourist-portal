import {Pressable, Text, View} from "react-native";
import TextInput from "../../components/TextInput";
import InputValidator from "../../helpers/InputValidator";
import {DatePickerInput} from "react-native-paper-dates";
import React, {useState} from "react";
import PhoneInput from "react-native-international-phone-number";


export const LocalForm = ({formData, setFormData}) => {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedDate, setSelectedDate] = useState();

    const setDate = (selectedDate) => {
        console.log(selectedDate)
        setSelectedDate(selectedDate)
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0'); // format to current timezone
        const dob = `${year}-${month}-${day}`;
        console.log(dob)
        setFormData({...formData, dob })
    }

    return (
        <View>
            <TextInput
                label="NRIC Number"
                returnKeyType="next"
                value={formData.nric}
                onChangeText={(nric) => setFormData({...formData, nric })}
                // error={!!email.error}
                errorText={InputValidator.nric(formData.nric)}
                autoCapitalize="none"
            />
            <View style={{marginTop: 30, marginBottom: 30}}>
                <DatePickerInput
                    locale="en-GB"
                    label="Date of Birth"
                    value={selectedDate}
                    onChange={setDate}
                    inputMode="start"
                />
            </View>
            <View style={{marginTop: 10, marginBottom: 10}}>
                <PhoneInput
                    value={formData.mobile}
                    onChangePhoneNumber={(mobile) => {
                        mobile = mobile.replace(' ', '')
                        setFormData({...formData, mobile})
                    }}
                    defaultCountry="SG"
                    selectedCountry={selectedCountry}
                    modalDisabled={true}
                    onChangeSelectedCountry={(selectedDate) => setSelectedCountry(selectedDate)}
                    returnKeyType='done'
                />
            </View>
        </View>
    )
}
