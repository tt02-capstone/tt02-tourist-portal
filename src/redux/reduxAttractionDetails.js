import axios from "axios";
import { attractionApi } from "../helpers/api";

export async function getAttraction(attraction_id) {
    try {
        const response = await attractionApi.get(`/getAttraction/${attraction_id}`);
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("Retrieve attraction error!");
    }
}

export async function getAttractionRecommendation(attraction_id) {
    try {
        const response = await attractionApi.get(`/getAttractionRecommendation/${attraction_id}`);
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("Retrieve recommendation error!");
    }
}

export async function saveAttraction(user_id,attraction_id) {
    try {
        const response = await attractionApi.put(`/saveAttractionForTouristAndLocal/${user_id}/${attraction_id}`);
        console.log(response)
        if (response.data.httpStatusCode == 400 || response.data.httpStatusCode == 404) {
            return {status:true, info:response.data.errorMessage};
        } else {
            return {status:false, info:response.data};
        }    
    } catch (error) {
        console.error("Save attraction error!");
    }
}

export async function checkTicketInventory(attraction_id,ticket_date,request_body) {
    try {
        const response = await attractionApi.post(`/checkTicketInventory/${attraction_id}/${ticket_date}`,request_body);
        console.log(response)
        if (response.data.httpStatusCode == 400 || response.data.httpStatusCode == 404) {
            return {status:true, error:response.data.errorMessage};
        } else {
            return {status:false};
        }    
    } catch (error) {
        console.error("Check ticket inventory error!");
    }
}