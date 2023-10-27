import React, { useState, useEffect } from 'react';
import Background from '../../components/CardBackground';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import TextInput from "../../components/TextInput";
import Toast from "react-native-toast-message";
import { Card } from '@rneui/themed';
import { Button } from 'react-native-paper';
import { getUser } from '../../helpers/LocalStorage';
import { useRoute } from '@react-navigation/native';
import { createCategoryItem, getAllByCategoryId } from '../../redux/categoryItemRedux';

const CategoryItemScreen = ({ navigation }) => {
    const [user, setUser] = useState('');
    const [data, setData] = useState([]);

    const route = useRoute();
    const { id } = route.params; // category id

    async function fetchUser() {
        const userData = await getUser()
        setUser(userData)
    }

    useEffect(() => {
        const fetchData = async (id) => {
            let response = await getAllByCategoryId(id);
            if (response.status) {
                setData(response.data);
            } else {
                console.log("Category item list not fetch!");
            }
        };

        fetchUser();
        fetchData(id);
    }, [id]);

    const viewPostList = (id) => {
        navigation.navigate('PostListScreen', { id: id }); // item.category_item_id
    }

    // show request modal
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState('');

    const onOpenModal = () => {
        setShowModal(true);
    }

    const onRequestPressed = async () => {
        if (formData.length <= 0) {
            Toast.show({
                type: 'error',
                text1: 'Request cannot be empty!'
            })
        } else {

            let tempCategoryItem = {
                name: formData,
                is_published: false
            };

            const response = await createCategoryItem(id, tempCategoryItem);
            if (response.status) {
                setShowModal(false);
                setFormData('')
                Toast.show({
                    type: 'success',
                    text1: 'Category Item Requested Made!'
                })
    
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
        <Background>
            <ScrollView>
                <View>
                    <View style={styles.container}>
                        <Button style={styles.button} mode="contained" onPress={onOpenModal}>Request For New Category Items</Button>
                    </View>

                    {data.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => viewPostList(item.category_item_id)}>
                            <Card>
                                <Card.Title style={styles.header}>
                                    {item.name}
                                </Card.Title>
                                <Card.Image
                                    style={{ padding: 0, height: 200 }}
                                    source={{
                                        uri: item.image
                                    }}
                                />
                            </Card>
                        </TouchableOpacity>
                    ))
                    }
                </View>

                <View style={styles.centeredView}>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showModal}
                        onRequestClose={() => {
                            setShowModal(false);
                        }}
                    >

                    <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalText}>Enter New Category Item</Text>

                                <TextInput
                                    returnKeyType="next"
                                    style={{width: 260, marginLeft: -10, marginTop: -15, marginBottom: 10}}
                                    value={formData}
                                    onChangeText={(formData) => setFormData(formData)}
                                    autoCapitalize="none"
                                />
                                
                                <View style={{flexDirection: 'row'}}>
                                    {/* submit modal button */}
                                    <Pressable
                                        style={[styles.modalButton, styles.buttonClose]}
                                        onPress={() => onRequestPressed()}>
                                        <Text style={styles.textStyle}>Request</Text>
                                    </Pressable>

                                    {/* close modal button */}
                                    <Pressable
                                        style={[styles.modalButton, styles.buttonClose]}
                                        onPress={() => {
                                            setShowModal(false);
                                            setFormData('')
                                        }}>
                                        <Text style={styles.textStyle}>Cancel</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </ScrollView>
        </Background>
    )
}
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    header: {
        color: '#044537',
        fontSize: 15
    },
    button: {
        marginTop: 20,
        marginBottom: 0,
        marginLeft: 0,
        backgroundColor: '#044537',
        width: 300,
        height: 40,
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: 250,
        width: 300,
        marginTop: -100
    },
    modalButton: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#044537',
    },
    buttonOpen: {
        backgroundColor: '#044537',
    },
    buttonClose: {
        backgroundColor: '#044537',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});

export default CategoryItemScreen