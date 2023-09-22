import axios from "axios";
import {TOKEN_KEY} from "./AuthContext";
import * as SecureStore from "expo-secure-store";

const HOST = '172.31.78.81'
const HOST_WITH_PORT = `http://${HOST}:8080`

export const userApi = axios.create({
    baseURL: HOST_WITH_PORT + '/user'
})

export const loggedUserApi = (usertype) => {
     if (usertype === 'LOCAL')
         return localApi
    else if (usertype === 'TOURIST')
        return touristApi
    else
        return Error('User type is neither local nor tourist')

}
export const localApi = axios.create({
    baseURL: HOST_WITH_PORT + '/local'
})

export const touristApi = axios.create({
    baseURL: HOST_WITH_PORT + '/tourist'
})

export const attractionApi = axios.create({
    baseURL: HOST_WITH_PORT + '/attraction'
})

export const bookingApi = axios.create({
    baseURL: HOST_WITH_PORT + '/booking'
})

export const paymentsApi = axios.create({
    baseURL: HOST_WITH_PORT + '/payment'

})

export const cartApi = axios.create({
    baseURL: HOST_WITH_PORT + '/cart'
})


const instanceList = [userApi, localApi, bookingApi, touristApi, attractionApi, paymentsApi, cartApi]

instanceList.map((api) => {
    api.interceptors.request.use( async (config) => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        config.headers.Authorization = token ? `Bearer ${token}` : '';
        return config;
    });
})

