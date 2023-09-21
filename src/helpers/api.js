import axios from "axios";

const HOST = '192.168.86.130'
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


export const updateApiInstances = (token) => {
    const bearerToken = token?  `Bearer ${token}`: ``;
    console.log('Bearer Token',bearerToken)
    localApi.defaults.headers.common['Authorization'] = bearerToken
    attractionApi.defaults.headers.common['Authorization'] = bearerToken
    bookingApi.defaults.headers.common['Authorization'] = bearerToken
    paymentsApi.defaults.headers.common['Authorization'] = bearerToken
    cartApi.defaults.headers.common['Authorization'] = bearerToken

}