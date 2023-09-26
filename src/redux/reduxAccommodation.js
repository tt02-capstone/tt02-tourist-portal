import axios from "axios";
import { accommodationApi } from "../helpers/api";

export async function getAccommodationList() {
    try {
        const response = await accommodationApi.get('/getAllPublishedAccommodation')
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

