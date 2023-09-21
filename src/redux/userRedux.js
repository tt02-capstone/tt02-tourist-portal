import { userApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";


export async function editPassword(userId, oldPassword, newPassword) {
  try {
    const response = await userApi.put(`/editPassword/${userId}/${oldPassword}/${newPassword}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("userRedux editPassword Error : ", error);
    // response.message.error
  }
}

export async function uploadNewProfilePic(user) {
  try {
    const response = await userApi.put(`/uploadNewProfilePic`, user);
    return handleApiErrors(response);
  } catch (error) {
    console.error("userRedux uploadNewProfilePic Error : ", error);
    // response.message.error
  }
}