import axios from "axios";

const userURL = "http://localhost:8080/user";
const touristURL = "http://localhost:8080/tourist";
const localURL = "http://localhost:8080/local";

export async function userLogin(email, password) { // both tourist and local combined
    console.log("Enter userLogin function", email, password);
    return await axios.put(`${userURL}/login/${email}/${password}`)
    .then((response) => {
      console.log(response);
      if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 422 || response.data.httpStatusCode === 404) { // error
        console.log('failure in userRedux :: userLogin');
        return {status: false, data: response.data};
      } else { // success
        console.log("success in userRedux :: userLogin");
        return {status: true, data: response.data};
      }
    })
    .catch((error) => {
      console.error("userRedux userLogin Error : ", error);
    });
}