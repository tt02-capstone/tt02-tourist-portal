import { touristApi } from "../helpers/api";

export async function editTouristProfile(edittedProfile) {
  console.log("Enter editTouristProfile function");
  return await touristApi.put(`/editTouristProfile`, edittedProfile)
  .then((response) => {
    console.log(response);
    if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 422) { // error
      console.log('failure in touristRedux :: editTouristProfile')
      return {status: false, data: response.data};
    } else { // success
      console.log("success in touristRedux :: editTouristProfile");
      return {status: true, data: response.data};
    }
  })
  .catch((error) => {
    console.error("touristRedux editTouristProfile: ", error);
  });
}