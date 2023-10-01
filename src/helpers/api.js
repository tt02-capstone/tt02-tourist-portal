import axios from "axios";
import {TOKEN_KEY} from "./AuthContext";
import * as SecureStore from "expo-secure-store";

const HOST = '192.168.18.66'
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

export const telecomApi = axios.create({
    baseURL: HOST_WITH_PORT + '/telecom'
})

export const tourApi = axios.create({
    baseURL: HOST_WITH_PORT + '/tour'
})

export const dealsApi = axios.create({
    baseURL: HOST_WITH_PORT + '/deal'
})

export const restaurantApi = axios.create({
    baseURL: HOST_WITH_PORT + '/restaurant'
})

export const recommendationApi = axios.create({
    baseURL: HOST_WITH_PORT + '/recommendation'
})


const instanceList = [userApi, localApi, bookingApi, touristApi, attractionApi, paymentsApi, cartApi, telecomApi, tourApi, restaurantApi, dealsApi, recommendationApi]

instanceList.map((api) => {
    api.interceptors.request.use( async (config) => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        config.headers.Authorization = token ? `Bearer ${token}` : '';
        return config;
    });
})

const refreshToken = async () => {
    try {
        const resp = await userApi.get("/refreshToken");
        console.log("refresh token", resp.data);
        return resp.data;
    } catch (e) {
        console.log("Error",e);
    }
};

instanceList.map((api) => {
    api.interceptors.response.use(
        (response) => {
            return response;
        },
        async function (error) {
            const originalRequest = error.config;
            console.log(error.response.status === 403 && !originalRequest._retry)
            if (error.response.status === 403 && !originalRequest._retry) {
                originalRequest._retry = true;
                const resp = await refreshToken();
                const newToken = resp.refreshToken;
                console.log("Refresh token", newToken)

                await SecureStore.setItemAsync(TOKEN_KEY, newToken);
                axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
                api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
                return api(originalRequest);
            }
            return Promise.reject(error);
        }
    );
})