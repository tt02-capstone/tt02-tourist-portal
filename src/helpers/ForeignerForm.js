import {useState, useContext, createContext} from "react";
import {Pressable, Text, View} from "react-native";
import TextInput from "../components/TextInput";
import InputValidator from "./InputValidator";
import DateTimePicker from '@react-native-community/datetimepicker';
import { CallingCodePicker } from '@digieggs/rn-country-code-picker';
// import RNDateTimePicker from "@react-native-community/datetimepicker";

export const ForeignerForm = ({formData, setFormData}) => {

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
