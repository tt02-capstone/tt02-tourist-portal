import axios from "axios";
import { attractionApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function getAttractionList() {
    try {
        const response = await attractionApi.get('/getAllPublishedAttraction')
        return handleApiErrors(response); 
    } catch (error) {
        console.error("Retrieve attraction list error!");
        return {status: false, data: error.message};
    }
}

export async function getAttraction(attraction_id) {
    try {
        const response = await attractionApi.get(`/getAttraction/${attraction_id}`);
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("Retrieve attraction error!");
        return {status: false, data: error.message};
    }
}

export async function checkTicketInventory(attraction_id,ticket_date,request_body) {
    try {
        const response = await attractionApi.post(`/checkTicketInventory/${attraction_id}/${ticket_date}`,request_body);
        if (response.data.httpStatusCode == 400 || response.data.httpStatusCode == 404 || response.data.httpStatusCode == 422) {
            return {status:true, error:response.data.errorMessage};
        } else {
            return {status:false};
        }    
    } catch (error) {
        console.error("Check ticket inventory error!");
        return {status: false, data: error.message};
    }
}

export async function saveAttraction(user_id,attraction_id) {
    try {
        const response = await attractionApi.put(`/saveAttractionForTouristAndLocal/${user_id}/${attraction_id}`);
        if (response.data.httpStatusCode == 400 || response.data.httpStatusCode == 404 || response.data.httpStatusCode == 422) {
            return {status:true, info:response.data.errorMessage};
        } else {
            return {status:false, info:response.data};
        }    
    } catch (error) {
        console.error("Save attraction error!");
        return {status: false, data: error.message};
    }
}

export async function getSavedAttractionList(user_id) {
    try {
        const response = await attractionApi.get(`/getSavedAttractionListForTouristAndLocal/${user_id}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("Retrieve saved attraction list error!");
        return {status: false, data: error.message};
    }
}

export async function deleteSavedAttraction(user_id,attraction_id) {
    try {
        const response = await attractionApi.delete(`/removeSavedAttractionForTouristAndLocal/${user_id}/${attraction_id}`);
        console.log(response)
        if (response.data != []) {
            return {status:false, info:response.data};
        } else {
            return {status:true, info:response.data.errorMessage};
        }    
    } catch (error) {
        console.error("Delete attraction error!");
        return {status: false, data: error.message};
    }
}

export async function getSeasonalActivity(attraction_id) {
    try {
        const response = await attractionApi.get(`/getSeasonalActivity/${attraction_id}`);
        if (response.data != [] && response.data.httpStatusCode != 404) { // not going to catch error here since errors means thr is no seasonal activity now 
            return response.data;
        }    
    } catch (error) {
        console.error("Retrieve recommendation error!");
        return {status: false, data: error.message};
    }
}