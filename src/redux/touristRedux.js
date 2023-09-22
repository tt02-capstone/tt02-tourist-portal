import { touristApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function editTouristProfile(editedProfile) {
  try {
    const response = await touristApi.put(`/editTouristProfile`, editedProfile);
    return handleApiErrors(response);
  } catch (error) {
    console.error("touristRedux editTouristProfile Error : ", error);
    return {status: false, data: error.message};
  }
}