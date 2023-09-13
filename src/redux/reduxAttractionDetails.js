import axios from "axios";

const HOST = ''
const baseURL = `http://${HOST}:8080/attraction`

export async function getAttraction(attraction_id) {
    try {
        const response = await axios.get(`${baseURL}/getAttraction/${attraction_id}`);
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("Retrieve attraction error!");
    }
}

export async function getAttractionRecommendation(attraction_id) {
    try {
        const response = await axios.get(`${baseURL}/getAttractionRecommendation/${attraction_id}`);
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("Retrieve recommendation error!");
    }
}

export async function saveAttraction(user_id,attraction_id) {
    try {
        const response = await axios.put(`${baseURL}/updateSavedAttractionListForTouristAndLocal/${user_id}/${attraction_id}`);
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