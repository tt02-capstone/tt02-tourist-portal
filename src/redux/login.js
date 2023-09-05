import axios from "axios";
import Toast from "react-native-toast-message";

const HOST = '172.18.28.167'
const baseURL = `http://${HOST}:8080/tourist`

export async function loginUser(email,password) {
    await axios.post(`${baseURL}/login/${email.value}/${password.value}`)
    .then((response) => {
        console.log(response.data.httpStatusCode)
        if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404) {
            console.log('error')
            Toast.show({
                type: 'error',
                text1: response.data.errorMessage
            })

            return false;

        } else {
            Toast.show({
                type: 'success',
                text1: 'Login Successful'
            })

            console.log('success', response.data)
            return true;
        }
    })
    .catch((error) => {
        console.error("Login Redux Error : ", error);
    });
    
}