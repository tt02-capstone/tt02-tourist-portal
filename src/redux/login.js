import axios from "axios";

const HOST = '172.18.28.167'
const baseURL = `http://${HOST}:8080/tourist`

export async function loginUser(email,password) {
    try {
        const response = await axios.post(`${baseURL}/login/${email.value}/${password.value}`)
        if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
            console.log('error',response.data)
            return {status:false, data:response.data};

        } else {
            console.log('success', response.data)
            return {status:true, data:response.data};
        }
    }
    catch(error){
        console.error("Login Redux Error : ", error);
    };
}