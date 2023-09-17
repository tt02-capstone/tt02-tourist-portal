import axios from "axios";
import { attractionApi } from "../helpers/api";

export async function getAttraction(attraction_id) {
    try {
        // const response = await axios.get(`${attractionApi}/getAttraction/${attraction_id}`);
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
        // const response = await axios.get(`${attractionApi}/getAttractionRecommendation/${attraction_id}`);
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
        // const response = await axios.put(`${attractionApi}/saveAttractionForTouristAndLocal/${user_id}/${attraction_id}`);
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