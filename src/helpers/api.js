import axios from "axios";

const HOST = '172.31.78.213'

const HOST_WITH_PORT = `http://${HOST}:8080`
export const touristApi = axios.create({
    baseURL: HOST_WITH_PORT + '/tourist'
})

