import { localApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function editLocalProfile(edittedProfile) {
  try {
    const response = await localApi.put(`/editLocalProfile`, edittedProfile);
    return handleApiErrors(response);
  } catch (error) {
    console.error("localRedux editLocalProfile: ", error);
    return {status: false, data: error.message};
  }
}