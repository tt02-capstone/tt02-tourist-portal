import axios from "axios";

const HOST = ''
const baseURL = `http://${HOST}:8080/attraction`

export async function getAttractionList() {
    try {
        const response = await axios.get(`${baseURL}/getAllPublishedAttraction`);
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("Retrieve attraction list error!");
    }
}