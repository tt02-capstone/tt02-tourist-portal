import axios from "axios";
import { attractionApi } from "../helpers/api";

export async function getAttractionList() {
    try {
        // const response = await axios.get(`${attractionApi}/getAllPublishedAttraction`);
        const response = await attractionApi.get('/getAllPublishedAttraction')
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("Retrieve attraction list error!");
    }
}