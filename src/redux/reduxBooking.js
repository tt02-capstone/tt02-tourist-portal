import axios from "axios";
import { bookingApi } from "../helpers/api";

export async function getBookingHistoryList(userId) {
    try {
        const response = await bookingApi.get(`/getAllBookingsByUser/${userId}`)
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("Retrieve booking history list error!");
        return {status: false, data: error.message};
    }
}

export async function getBookingByBookingId(bookingId) {
    try {
        const response = await bookingApi.get(`/getBookingByBookingId/${bookingId}`);
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("Retrieve booking details error!");
        return {status: false, data: error.message};
    }
}

export async function cancelBookingByBookingId(bookingId) {
    try {
        const response = await bookingApi.put(`/cancelBooking/${bookingId}`);
        if (response.data.httpStatusCode == 400 || response.data.httpStatusCode == 404 || response.data.httpStatusCode == 422) {
            return {status:true, info:response.data.errorMessage};
        } else {
            return {status:false, info:response.data};
        }    
    } catch (error) {
        console.error("Cancel booking error!");
        return {status: false, data: error.message};
    }
}

export async function getPaymentHistoryList(userId) {
    try {
        const response = await bookingApi.get(`/getAllPaymentsByUser/${userId}`)
        if (response.data != []) {
            return response.data;
        }    
    } catch (error) {
        console.error("Retrieve payment history list error!");
        return {status: false, data: error.message};
    }
}