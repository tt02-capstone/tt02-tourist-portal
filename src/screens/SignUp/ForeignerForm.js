import {Pressable, Text, View} from "react-native";
import TextInput from "../../components/TextInput";
import InputValidator from "../../helpers/InputValidator";
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
            />
            <TextInput
                label="Mobile Number"
                returnKeyType="next"
                value={formData.mobile}
                onChangeText={(mobile) => setFormData({...formData, mobile })}
                // error={!!email.error}
                errorText={InputValidator.mobileNo(formData.mobile)}
                autoCapitalize="none"
                keyboardType="phone-pad"
            />
        </View>
    )
}
