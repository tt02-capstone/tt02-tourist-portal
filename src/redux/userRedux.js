import { userApi, badgeApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";


export async function editPassword(userId, oldPassword, newPassword) {
  try {
    const response = await userApi.put(`/editPassword/${userId}/${oldPassword}/${newPassword}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("userRedux editPassword Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function uploadNewProfilePic(user) {
  try {
    const response = await userApi.put(`/uploadNewProfilePic`, user);
    return handleApiErrors(response);
  } catch (error) {
    console.error("userRedux uploadNewProfilePic Error : ", error);
    return {status: false, data: error.message};
  };
}

export async function viewUserProfile(userId) {
  try {
    const response = await userApi.get(`/viewUserProfile/${userId}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("userRedux viewUserProfile Error : ", error);
    return {status: false, data: error.message};
  };
}

export async function retrieveBadgesByUserId(userId) {
  try {
      const response = await badgeApi.get(`/retrieveBadgesByUserId/${userId}`);
      return handleApiErrors(response);
  } catch (error) {
      console.error("forumRedux retrieveBadgesByUserId Error : ", error);
      return { status: false, data: error.message };
  }
}

export async function markBadgeAsPrimary(badgeId,userId) {
  try {
      const response = await badgeApi.put(`/markBadgeAsPrimary/${badgeId}/${userId}`);
      return handleApiErrors(response);
  } catch (error) {
      console.error("forumRedux markBadgeAsPrimary Error : ", error);
      return { status: false, data: error.message };
  }
}

export async function getPrimaryBadge(userId) {
  try {
      const response = await badgeApi.get(`/getPrimaryBadge/${userId}`);
      return handleApiErrors(response);
  } catch (error) {
      console.error("forumRedux getPrimaryBadge Error : ", error);
      return { status: false, data: error.message };
  }
}