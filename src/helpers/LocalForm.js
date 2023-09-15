import {Pressable, Text, View} from "react-native";
import TextInput from "../components/TextInput";
import InputValidator from "./InputValidator";


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
                autoCompleteType="nric"
                textContentType="nric"
            />
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
                keyboardType="phone-pad"
            />
        </View>
    )
}
