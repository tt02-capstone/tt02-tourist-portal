import * as SecureStore from "expo-secure-store";

export const storeUser = async (userData) => {
    try {
        // console.log('Inside async',userData)
        // console.log('Inside async usertype',userData["user_type"]);
        const jsonUser = JSON.stringify(userData);
        await SecureStore.setItemAsync('user', jsonUser);
        await SecureStore.setItemAsync('usertype', userData["user_type"]);
    } catch (e) {
        console.log('Async Storage storeUser fail', e)
    }
};

export const getUser = async () => {
    try {
        const jsonValue = await SecureStore.getItemAsync('user');
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.log('Async Storage getUser fail', e)
    }
};

export const getUserType = async () => {
    try {
        return await SecureStore.getItemAsync('usertype');
    } catch (e) {
        console.log('Async Storage getUserType fail', e)
    }
};

export const clearStorage = async () => {
    try {
        await SecureStore.deleteItemAsync('usertype');
        await SecureStore.deleteItemAsync('user');
    } catch (e) {
        console.log('Async Storage clearStorage fail', e)
    }
};

export const getEmail = async () => {
    try {
        return await SecureStore.getItemAsync('email');
        
    } catch (e) {
        console.log('Async Storage getEmail fail', e)
    }
};