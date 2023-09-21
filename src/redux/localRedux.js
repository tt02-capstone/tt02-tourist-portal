import { localApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function editLocalProfile(edittedProfile) {
  console.log("Enter editLocalProfile function");
  return await localApi.put(`/editLocalProfile`, edittedProfile)
  .then((response) => {
    console.log('in localRedux :: editLocalProfile')
      handleApiErrors(response);
  })
  .catch((error) => {
    console.error("localRedux editLocalProfile: ", error);
  });
}