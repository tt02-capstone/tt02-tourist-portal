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


export async function retrieveAccommodationByRoom(room_id) {
    try {
        const response = await accommodationApi.get(`/retrieveAccommodationByRoom/${room_id}`);
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("retrieveAccommodationByRoom error!");
        return {status: false, data: error.message};
    }
}


// export async function getNumOfBookingsOnDate(accommodation_id, roomType, date) {
//     try {
//         const response = await accommodationApi.get(`/getNumOfBookingsOnDate/${accommodation_id}/${roomType}/${date}`);
//         console.log("response", response.data);
//         if (response.data != []) {
//             return response.data;
//         }    
//     } catch (error) {
//         console.error("getNumOfBookingsOnDate error!");
//         return {status: false, data: error.message};
//     }
// }

export async function getMinAvailableRoomsOnDateRange(accommodation_id, roomType, checkInDate, checkOutDate) {
    try {
        const response = await accommodationApi.get(`/getMinAvailableRoomsOnDateRange/${accommodation_id}/${roomType}/${checkInDate}/${checkOutDate}`);
        console.log("response", response.data);
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("getMinAvailableRoomsOnDateRange error!");
        return {status: false, data: error.message};
    }
}