import axios from "axios";

const HOST = '172.31.77.26'
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


export const updateApiInstances = (token) => {
    const bearerToken = token?  `Bearer ${token}`: ``;
    console.log('Bearer Token',bearerToken)
    localApi.defaults.headers.common['Authorization'] = bearerToken
    touristApi.defaults.headers.common['Authorization'] = bearerToken
}