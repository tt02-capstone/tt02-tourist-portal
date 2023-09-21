import {Pressable, Text, View} from "react-native";
import TextInput from "../../components/TextInput";
import InputValidator from "../../helpers/InputValidator";
import {DatePickerInput} from "react-native-paper-dates";
import {SafeAreaProvider} from "react-native-safe-area-context";
import React, {useState} from "react";
import PhoneInput, {ICountry} from 'react-native-international-phone-number';

export const ForeignerForm = ({formData, setFormData}) => {
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
                label="Passport Number"
                returnKeyType="next"
                value={formData.passport}
                onChangeText={(passport) => setFormData({...formData, passport })}
                // error={!!email.error}
                errorText={InputValidator.passport(formData.passport)}
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
                    defaultCountry={"SG"}
                    selectedCountry={selectedCountry}
                    onChangeSelectedCountry = {(country) => {
                        setSelectedCountry(country);
                        let countryCode = country.callingCode.replace('+', '')
                        setFormData({...formData, countryCode})
                    }}
                />
            </View>
        </View>
    )
}
