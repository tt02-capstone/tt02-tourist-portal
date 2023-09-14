import {useState, useContext, createContext} from "react";
import {Pressable, Text, View} from "react-native";
import TextInput from "../components/TextInput";
import InputValidator from "./InputValidator";
import DateTimePicker from '@react-native-community/datetimepicker';
import { CallingCodePicker } from '@digieggs/rn-country-code-picker';
// import RNDateTimePicker from "@react-native-community/datetimepicker";

export const LocalForm = ({formData, setFormData}) => {

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
                autoCompleteType="passport"
                textContentType="passport"
                keyboardType="passport"
            />

            {/*<RNDateTimePicker*/}
            {/*    value={formData.dob}*/}
            {/*    is24Hour={true}*/}
            {/*    onChange={(event, dob) => setFormData({...formData, dob })}*/}
            {/*/>*/}
            <TextInput
                label="Mobile Number"
                returnKeyType="next"
                value={formData.mobile}
                onChangeText={(mobile) => setFormData({...formData, mobile })}
                // error={!!email.error}
                errorText={InputValidator.mobileNo(formData.mobile)}
                autoCapitalize="none"
                autoCompleteType="mobile"
                textContentType="mobile"
                keyboardType="mobile"
            />
        </View>
    )
}
