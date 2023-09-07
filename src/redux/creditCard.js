import axios from "axios";

const HOST = ''

const baseURL = `http://${HOST}:8080/payment`
console.log(baseURL)
// This would be merged with Tourist Sign Up
export async function createStripeCustomer(tourist_email, tourist_name) {
    try {
        const response = await axios.post(`${baseURL}/createStripeCustomer/${tourist_email}/${tourist_name}`)
        console.log(response.data.httpStatusCode)
        if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
            console.log('error',response.data)
            return {status:false, data:response.data};

        } else {
            console.log('success', response.data)
            return {status:true, data:response.data};
        }
    }
    catch(error){
        console.error("Create Stripe Customer Redux Error : ", error);
    };
}

export async function getPaymentMethods(tourist_email) {
    try {
        const response = await axios.get(`${baseURL}/getPaymentMethods`)
        console.log(response.data.httpStatusCode)
        if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
            console.log('error',response.data)
            return {status:false, data:response.data};

        } else {
            console.log('success', response.data)
            return {status:true, data:response.data};
        }
    }
    catch(error){
        console.error("Get Payment Methods Redux Error : ", error);
    };
}

export async function addPaymentMethod(tourist_email, stripe_payment_id) {
    try {
        const response = await axios.post(`${baseURL}/addPaymentMethod`)
        console.log(response.data.httpStatusCode)
        if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
            console.log('error',response.data)
            return {status:false, data:response.data};

        } else {
            console.log('success', response.data)
            return {status:true, data:response.data};
        }
    }
    catch(error){
        console.error("Add Payment Redux Error : ", error);
    };
}

export async function updatePaymentMethod(tourist_email) {
    try {
        const response = await axios.post(`${baseURL}/updatePaymentMethod`)
        console.log(response.data.httpStatusCode)
        if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
            console.log('error',response.data)
            return {status:false, data:response.data};

        } else {
            console.log('success', response.data)
            return {status:true, data:response.data};
        }
    }
    catch(error){
        console.error("Add Payment Redux Error : ", error);
    };
}

export async function deletePaymentMethod(tourist_email) {
    try {
        const response = await axios.post(`${baseURL}/deletePaymentMethod`)
        console.log(response.data.httpStatusCode)
        if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
            console.log('error',response.data)
            return {status:false, data:response.data};

        } else {
            console.log('success', response.data)
            return {status:true, data:response.data};
        }
    }
    catch(error){
        console.error("Add Payment Redux Error : ", error);
    };
}