import AsyncStorage from '@react-native-async-storage/async-storage'

export const storeUser = async (userData) => {
    try {
        const jsonUser = JSON.stringify(userData);
        // console.log(userData)
        // console.log(userData.user_type)
        await AsyncStorage.setItem('user', jsonUser);
        await AsyncStorage.setItem('usertype', userData.user_type);
    } catch (e) {
        console.log('Async Storage storeUser fail', e)
    }
};

export const getUser = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('user');
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.log('Async Storage getUser fail', e)
    }
};

export const getUserType = async () => {
    try {
        return await AsyncStorage.getItem('usertype');
    } catch (e) {
        console.log('Async Storage getUserType fail', e)
    }
};

export const clearStorage = async () => {
    try {
        await AsyncStorage.clear();
    } catch (e) {
        console.log('Async Storage clearStorage fail', e)
    }
};