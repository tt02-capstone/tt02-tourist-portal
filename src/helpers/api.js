import axios from "axios";

const HOST = '172.31.94.208.'

const HOST_WITH_PORT = `http://${HOST}:8080`
export const touristApi = axios.create({
    baseURL: HOST_WITH_PORT + '/tourist'
})

export const userApi = axios.create({
    baseURL: HOST_WITH_PORT + '/user'
})
export const localApi = axios.create({
    baseURL: HOST_WITH_PORT + '/local'
})
