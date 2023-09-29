import axios from "axios";
import { accommodationApi } from "../helpers/api";
import {handleApiErrors} from "../helpers/errorCatching";

export async function getAccommodationList() {
    try {
        const response = await accommodationApi.get('/getAllPublishedAccommodation')
        console.log(response)
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("Retrieve accommodation list error!");
        return {status: false, data: error.message};
    }
}

export async function getAccommodation(accommodation_id) {
    try {
        const response = await accommodationApi.get(`/getAccommodation/${accommodation_id}`);
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("Retrieve accommodation error!");
        return {status: false, data: error.message};
    }
}


export async function toggleSaveAccommodation(userId, accommodationId) {
    try {
        console.log(userId, accommodationId)
        const response = await accommodationApi.put(`/toggleSaveAccommodation/${userId}/${accommodationId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("accommodationRedux toggleSaveAccommodation Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function getUserSavedAccommodation(userId) {
    try {
        const response = await accommodationApi.get(`/getUserSavedAccommodation/${userId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("accommodationRedux getUserSavedAccommodation Error : ", error);
        return {status: false, data: error.message};
    }
}