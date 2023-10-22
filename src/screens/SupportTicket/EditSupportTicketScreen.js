
import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import Header from '../../components/Header';
import TextInput from '../../components/TextInput';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, CheckBox, Tab, TabView } from '@rneui/themed';
import InputValidator from '../../helpers/InputValidator';
import { getSupportTicket, updateSupportTicket } from '../../redux/supportRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'
import RNPickerSelect from 'react-native-picker-select';

const EditSupportTicketScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [supportTicket, setSupportTicket] = useState('');
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        description: '',
        ticket_category: '',
    });

    const route = useRoute();
    const { supportTicketId } = route.params;

    async function fetchUser() {
        const userData = await getUser();
        setUser(userData);

        const userType = await getUserType();
    }

    const fetchSupportTicket = async () => {
        console.log("supportTicketId", supportTicketId);
        try {
            let response = await getSupportTicket(supportTicketId);
            console.log("response", response);
            setSupportTicket(response.data);
            setLoading(false);
            fetchUser();

            setValues({
                ticket_type: response.data.ticket_type,
                description: response.data.description,
                ticket_category: response.data.ticket_category,
            })
        } catch (error) {
            alert('An error occur! Failed to retrieve supportTicket details!');
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSupportTicket();
    }, []);

    async function handleEdit(ticketId) {

        let supportTicketObj = {
            description: values.description,
            ticket_category: values.ticket_category,
        }

        console.log("supportTicketObj", supportTicketObj);
        console.log("supportTicketId", supportTicketId);

        let response = await updateSupportTicket(supportTicketId, supportTicketObj);
        if (response.status) {
            Toast.show({
                type: 'success',
                text1: 'Support ticket edited!'
            })

            navigation.reset({
                index: 3,
                routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'SupportTicketScreen' }, { name: 'SupportTicketDetailsScreen', params: { supportTicketId: supportTicketId } }],
            });

        } else {
            console.log("Support ticket edit failed!");
            console.log(response.data);
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }

    return (
        <Background style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.header}>
                Edit Support Ticket
            </Text>

            <ScrollView automaticallyAdjustKeyboardInsets={true}>
                <View style={{ alignItems: 'center', minHeight: '100%' }}>
                    {/* <RNPickerSelect
                        placeholder={{
                            label: 'Select Category...',
                            value: null,
                        }}
                        onValueChange={(value) => setValues({ ...values, ticket_category: value })}
                        items={[
                            { label: 'General Enquiry', value: 'GENERAL_ENQUIRY' },
                            { label: 'General Booking', value: 'BOOKING' },
                            { label: 'Refund', value: 'REFUND' },
                            { label: 'Cancellation', value: 'CANCELLATION' },
                            { label: 'Attraction', value: 'ATTRACTION' },
                            { label: 'Accommodation', value: 'ACCOMMODATION' },
                            { label: 'Restaurant', value: 'RESTAURANT' },
                            { label: 'Telecom', value: 'TELECOM' },
                            { label: 'Deal', value: 'DEAL' },
                            { label: 'Tour', value: 'TOUR' },
                        ]}
                        value={values.ticket_category}
                        style={pickerSelectStyles}
                    /> */}
                    <TextInput
                        style={styles.description}
                        label="Write your message here"
                        multiline={true}
                        value={values.description}
                        onChangeText={(description) => setValues({ ...values, description })}
                        errorText={values.description ? InputValidator.text(values.description) : ''}
                    />
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Button
                            mode="contained"
                            text={"Submit"}
                            onPress={handleEdit}
                        />
                    </View>
                </View>
            </ScrollView>
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
        textAlignVertical: 'top'
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

export default EditSupportTicketScreen
