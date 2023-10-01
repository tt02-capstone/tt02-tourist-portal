import React , { useState, useEffect } from 'react'
import { useIsFocused } from "@react-navigation/native";
import Background from '../../components/CardBackground'
import { Button } from 'react-native-paper';
import CartButton from '../../components/Button';
import { theme } from '../../core/theme'
import { getUser, storeUser } from '../../helpers/LocalStorage';
import { View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import { Text, Card } from '@rneui/themed';
import Icon from 'react-native-vector-icons/FontAwesome';
import { DatePickerInput } from 'react-native-paper-dates';
import { useRoute } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import { cartApi } from '../../helpers/api';
import { getTelecomById, toggleSaveTelecom } from '../../redux/telecomRedux';
import { addTelecomToCart } from '../../redux/cartRedux';

const DealDetailsScreen = ({ navigation }) => {
}

const styles = StyleSheet.create({
    container:{
        flex:1
    },
    rCard:{
        flex:1,
        width: 320,
        height: 100,
        borderRadius: 4,
        margin: 2
    },
    header:{
        textAlign: 'left',
        fontSize: 20,
        color: '#044537',
        flexDirection: 'row'
    },
    image: {
        width: 30,height: 30,marginRight: 10,
    },
    name: {
        fontSize: 16,marginTop: 5,
    },
    subtitle: {
        marginBottom: 5, fontSize: 12, color: 'grey'
    },
    description: {
        marginBottom: 10, fontSize: 12, marginTop : 10 
    },
    activityHeader: {
        marginBottom: 5, fontSize: 12,  fontWeight: "bold"
    },
    activity: {
        marginBottom: 5, fontSize: 11
    },
    pricing: {
        marginBottom: 0, fontSize: 12, marginTop : 0
    },
    recommendation:{
        marginBottom: 10, textAlign: 'center', marginTop : 10 
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
    cartOut: {
        width: 330,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartButton:{
        marginTop: -5,
        width: '100%',
        alignSelf: 'center',
    }
    
});

export default DealDetailsScreen