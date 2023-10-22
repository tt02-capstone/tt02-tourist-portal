import React, { useState, useEffect } from 'react'
import Background from '../../components/CardBackground'
import Button from '../../components/Button'
import TextInput from '../../components/TextInput';
import InputValidator from '../../helpers/InputValidator';
import { getUser, getUserType } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, CheckBox } from '@rneui/themed';
import { getSupportTicket, updateSupportTicketStatus, deleteSupportTicket, getAllRepliesBySupportTicket, createReply, deleteReply } from '../../redux/supportRedux';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { theme } from '../../core/theme'
import { IconButton } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';

const SupportTicketDetailsScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [supportTicket, setSupportTicket] = useState('');
    const [replyList, setReplyList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('view');
    const [values, setValues] = useState({
        ticket_type: '',
        description: '',
        ticket_category: '',
    });
    const [newReply, setNewReply] = useState('');
    const [editedReply, setEditedReply] = useState('');
    const [replyIdToEdit, setReplyIdToEdit] = useState('');

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

    const fetchReplyList = async () => {
        try {
            let response = await getAllRepliesBySupportTicket(supportTicketId);
            setReplyList(response.data);
            setLoading(false);

        } catch (error) {
            alert('An error occur! Failed to retrieve reply list!');
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSupportTicket(); // when the page load the first time
        fetchReplyList();
    }, []);

    const handleDeleteSupportTicketPress = (ticketId) => {
        Alert.alert(
            "Delete Confirmation",
            "Are you sure you want to delete this ticket?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Delete Cancelled"),
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: () => handleDeleteSupportTicket(ticketId)
                }
            ],
            { cancelable: false }
        );
    };

    async function handleDeleteSupportTicket(supportTicketId) {
        let response = await deleteSupportTicket(supportTicketId);
        if (response.status) {
            navigation.reset({
                index: 2,
                routes: [{ name: 'Drawer' }, { name: 'HomeScreen' }, { name: 'SupportTicketScreen' }],

            });
            console.log("createSupportTicket response", response.status)
            Toast.show({
                type: 'success',
                text1: 'Support ticket deleted!'
            })

        } else {
            console.log("Support ticket deletion failed!");
            console.log(response.data);
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }

    const handleDeleteReplyPress = (replyId) => {

        Alert.alert(
            "Delete Confirmation",
            "Are you sure you want to delete this reply?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Delete Cancelled"),
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: () => handleDeleteReply(supportTicketId, replyId)
                }
            ],
            { cancelable: false }
        );
    };

    async function handleDeleteReply(replySupportTicketId, replyId) {

        let response = await deleteReply(replySupportTicketId, replyId);

        if (response.status) {

            Toast.show({
                type: 'success',
                text1: 'Reply deleted!'
            })

            fetchReplyList();

        } else {
            console.log("Reply deletion failed!");
            console.log(response.data);
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }


    const getNameForSupportTicket = (item) => {
        if (item.booking != null) {
            if (item.booking.attraction != null) {
                return 'Enquiry to ' + item.booking.attraction.name;
            } else if (item.booking.room != null) {
                return 'Enquiry to ' + item.booking.activity_name;
            } else if (item.booking.tour != null) {
                return 'Enquiry to ' + item.booking.tour.name;
            } else if (item.booking.telecom != null) {
                return 'Enquiry to ' + item.booking.telecom.name;
            } else if (item.booking.deal != null) {
                return 'Enquiry to ' + item.booking.deal.name;
            } else {
                return 'Booking not linked';
            }
        } else if (item.attraction != null) {
            return 'Enquiry to ' + item.attraction.name;
        } else if (item.accommodation != null) {
            return 'Enquiry to ' + item.accommodation.name;
        } else if (item.tour != null) {
            return 'Enquiry to ' + item.tour.name;
        } else if (item.telecom != null) {
            return 'Enquiry to ' + item.telecom.name;
        } else if (item.restaurant != null) {
            return 'Enquiry to ' + item.restaurant.name;
        } else if (item.deal != null) {
            return 'Enquiry to ' + item.restaurant.name;
        } else {
            return 'Enquiry to Admin';
        }
    }

    const getReplyUserType = (item) => {
        if (item.tourist_user != null) {
            return 'Tourist';
        } else if (item.local_user != null) {
            return 'Local';
        } else if (item.vendor_staff_user != null) {
            if (supportTicket.attraction != null) {
                return 'Vendor' + ' - ' + supportTicket.attraction.name;
            } else if (supportTicket.accommodation != null) {
                return 'Vendor' + ' - ' + supportTicket.accommodation.name;
            } else if (supportTicket.tour != null) {
                return 'Vendor' + ' - ' + supportTicket.tour.name;
            } else if (supportTicket.telecom != null) {
                return 'Vendor' + ' - ' + supportTicket.telecom.name;
            } else if (supportTicket.restaurant != null) {
                return 'Vendor' + ' - ' + supportTicket.restaurant.name;
            } else if (supportTicket.deal != null) {
                return 'Vendor' + ' - ' + supportTicket.deal.name;
            } else {
                return 'Vendor';
            }
        } else if (item.internal_staff_user != null) {
            return 'Admin';
        } else {
            return 'Error';
        }
    }

    const getReplyUser = (item) => {
        if (item.tourist_user != null) {
            return item.tourist_user.name;
        } else if (item.local_user != null) {
            return item.local_user.name;
        } else if (item.vendor_staff_user != null) {
            return item.vendor_staff_user.name;
        } else if (item.internal_staff_user != null) {
            return item.internal_staff_user.name;
        } else {
            return 'Error';
        }
    }

    async function handleReplySubmit() {

        let replyObj;

        console.log("user.user_id", user.user_id)

        replyObj = {
            message: newReply,
        }

        let response = await createReply(user.user_id, supportTicketId, replyObj);
        if (response.status) {
            console.log("createReply response", response.status)
            Toast.show({
                type: 'success',
                text1: 'Reply created!'
            })

            setNewReply('');

            fetchReplyList();

        } else {
            console.log('error')
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }

    async function handleTicketStatus() {

        let response = await updateSupportTicketStatus(supportTicketId);
        if (response.status) {
            console.log("updateSupportTicketStatus response", response.status)
            Toast.show({
                type: 'success',
                text1: 'Support ticket is now ' + (supportTicket.is_resolved ? 'open' : 'closed') + '!'
            });

            fetchSupportTicket();

        } else {
            console.log('error')
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })
        }
    }

    const formatType = (type) => {
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }

    const formatStatus = (is_resolved) => {
        if (is_resolved) {
            return 'Closed';
        } else {
            return 'Open';
        }
    }

    const formatCategory = (ticket_category) => {
        if (ticket_category === 'ATTRACTION') {
            return 'Attraction';
        } else if (ticket_category === 'TOUR') {
            return 'Tour';
        } else if (ticket_category === 'ACCOMMODATION') {
            return 'Accommodation';
        } else if (ticket_category === 'TELECOM') {
            return 'Telecom';
        } else if (ticket_category === 'RESTAURANT') {
            return 'Restaurant';
        } else if (ticket_category === 'DEAL') {
            return 'Deal';
        } else if (ticket_category === 'REFUND') {
            return 'Booking - Refund';
        } else if (ticket_category === 'CANCELLATION') {
            return 'Booking - Cancellation';
        } else if (ticket_category === 'GENERAL_ENQUIRY') {
            return 'General Enquiry';
        } else if (ticket_category === 'BOOKING') {
            return 'Booking - General';
        }

    }

    function formatLocalDateTime(localDateTimeString) {
        const dateTime = new Date(localDateTimeString);

        const day = String(dateTime.getDate()).padStart(2, '0');
        const month = String(dateTime.getMonth() + 1).padStart(2, '0');
        const year = dateTime.getFullYear();
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        const period = dateTime.getHours() < 12 ? 'AM' : 'PM';

        return `${day}/${month}/${year}, ${hours}:${minutes} ${period}`;
    }

    return (
        <ScrollView automaticallyAdjustKeyboardInsets={true}>
            <Card>
                <View style={styles.headerContainer}>
                    <Card.Title style={[styles.header, replyList.length === 0 ? {} : { maxWidth: '100%' }]}>
                        {getNameForSupportTicket(supportTicket)}
                    </Card.Title>

                    <View style={styles.iconContainer}>
                        {replyList.length === 0 ? (
                            <>
                                <IconButton
                                    icon="pencil"
                                    size={20}
                                    style={styles.icon}
                                    onPress={() => navigation.navigate('EditSupportTicketScreen', { supportTicketId: supportTicket.support_ticket_id })}
                                />
                                <IconButton
                                    icon="delete"
                                    size={20}
                                    style={styles.icon}
                                    onPress={() => handleDeleteSupportTicketPress(supportTicketId)}
                                /></>
                        ) : (
                        <></>
                        )}
                    </View>
                </View>
                <Text style={styles.description}>{supportTicket.description}</Text>
                <Text style={styles.details}>
                    <Text style={styles.boldText}>Category:</Text> {formatCategory(supportTicket.ticket_category)}
                </Text>
                <Text style={styles.details}>
                    <Text style={styles.boldText}>Status:</Text> {formatStatus(supportTicket.is_resolved)}
                </Text>
                <Text style={styles.details}>
                    <Text style={styles.boldText}>Created:</Text> {formatLocalDateTime(supportTicket.created_time)}
                </Text>
                <Text style={styles.details}>
                    <Text style={styles.boldText}>Updated:</Text> {formatLocalDateTime(supportTicket.updated_time)}
                </Text>
            </Card>

            {replyList.length > 0 ? (
                <>
                    {replyList.map((item, index) => (
                        <View key={index}>
                            <Card>
                                <View style={styles.headerContainer}>
                                    <View>
                                        <Text style={styles.replyUserType}>{getReplyUserType(item)}</Text>
                                        <Text style={styles.replyUser}>{getReplyUser(item)}</Text>
                                    </View>

                                    {/* display edit and delete icons only if it is a reply from current user + there are no replies after it */}
                                    {((item.local_user != null && item.local_user.user_id == user.user_id)
                                        || (item.tourist_user != null && item.tourist_user.user_id == user.user_id))
                                        && index === replyList.length - 1 ? (
                                        <View style={styles.iconContainer}>
                                            <IconButton
                                                icon="pencil"
                                                size={20}
                                                style={styles.icon}
                                                onPress={() => navigation.navigate('EditReplyScreen', { replyId: item.reply_id, replySupportTicketId: supportTicketId })}
                                            />
                                            <IconButton
                                                icon="delete"
                                                size={20}
                                                style={styles.icon}
                                                onPress={() => handleDeleteReplyPress(item.reply_id)}
                                            />
                                        </View>
                                    ) : (<></>)}
                                </View>

                                <Text style={styles.description}>{item.message}</Text>
                                <Text style={styles.details}>
                                    <Text style={styles.boldText}>Created:</Text> {formatLocalDateTime(item.created_time)}
                                </Text>
                                <Text style={styles.details}>
                                    <Text style={styles.boldText}>Updated:</Text> {formatLocalDateTime(item.updated_time)}
                                </Text>

                            </Card>
                        </View>
                    ))}

                    {supportTicket.is_resolved ? (
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                            <View style={styles.lineContainer}>
                                <View style={styles.line}></View>
                                <Text>Ticket is closed</Text>
                                <View style={styles.line}></View>
                            </View>
                            <Button
                                mode="contained"
                                text={"Reopen Ticket"}
                                style={{ width: '40%' }}
                                onPress={handleTicketStatus}
                            />
                        </View>
                    ) : (
                        <View>
                            <View style={styles.newReplyContainer}>
                                <TextInput
                                    style={styles.newReply}
                                    label="Write your reply here"
                                    multiline={true}
                                    value={newReply}
                                    onChangeText={(value) => setNewReply(value)}
                                    errorText={newReply ? InputValidator.text(newReply) : ''}
                                />
                                <Button
                                    mode="contained"
                                    text={"Submit"}
                                    style={styles.button}
                                    labelStyle={styles.buttonText}
                                    onPress={handleReplySubmit}
                                />
                            </View>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Button
                                    mode="contained"
                                    text={"Close Ticket"}
                                    style={{ width: '40%' }}
                                    onPress={handleTicketStatus}
                                />
                            </View>
                        </View>
                    )}

                </>
            ) : (
                <Card>
                    <Text style={styles.noReplies}>
                        No replies yet!
                    </Text>
                </Card>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginLeft: -5,
        marginTop: -5,
        marginRight: 3,
    },
    header: {
        flexWrap: 'wrap',
        textAlign: 'left',
        fontSize: 15,
        color: '#044537',
        marginTop: 10,
        marginLeft: 10,
    },
    replyUserType: {
        fontSize: 13,
        color: 'gray',
        marginTop: 5,
        marginLeft: 5,
    },
    replyUser: {
        fontSize: 15,
        color: '#044537',
        marginTop: 5,
        marginLeft: 5,
    },
    deleteIcon: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 1
    },
    image: {
        width: 30, height: 30, marginRight: 10,
    },
    name: {
        fontSize: 16, marginTop: 5,
    },
    description: {
        marginBottom: 10, fontSize: 13, marginTop: 10, marginLeft: 5,
    },
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
    dropBorder: {
        borderWidth: 0,
        shadowColor: 'rgba(0,0,0, 0.0)',
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        backgroundColor: theme.colors.surface,
    },
    details: {
        fontSize: 12,
        marginBottom: 5,
        marginLeft: 5,
    },
    boldText: {
        fontWeight: 'bold',
    },
    newReply: {
        width: '60%',
        marginLeft: 170,
    },
    noReplies: {
        textAlign: 'center',
        fontSize: 15,
        color: '#044537',
    },
    newReplyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        marginBottom: 5,
    },
    button: {
        width: '24%',
        marginLeft: 20,
        marginRight: 170,
        borderRadius: 5,
        marginBottom: 3,
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 12,
        color: 'white',
        lineHeight: 26,
    },
    lineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'darkgray',
        width: '100%',
        marginHorizontal: '5%',
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

export default SupportTicketDetailsScreen
