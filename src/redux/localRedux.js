import { localApi } from "../helpers/api";

export async function editLocalProfile(edittedProfile) {
  console.log("Enter editLocalProfile function");
  return await localApi.put(`/editLocalProfile`, edittedProfile)
  .then((response) => {
    console.log(response);
    if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 422) { // error
      console.log('failure in localRedux :: editLocalProfile')
      return {status: false, data: response.data};
    } else { // success
      console.log("success in localRedux :: editLocalProfile");
      return {status: true, data: response.data};
    }
  })
  .catch((error) => {
    console.error("localRedux editLocalProfile: ", error);
    return {status: false, data: error.message};
  });
}