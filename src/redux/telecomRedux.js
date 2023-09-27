import { telecomApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function getPublishedTelecomList() {
    try {
      const response = await telecomApi.get(`/getPublishedTelecomList`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("telecomRedux getPublishedTelecomList Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function getTelecomById(id) {
    try {
      const response = await telecomApi.get(`/getTelecomById/${id}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("telecomRedux getTelecomById Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function toggleSaveTelecom(userId, telecomId) {
    try {
      const response = await telecomApi.put(`/toggleSaveTelecom/${userId}/${telecomId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("telecomRedux saveTelecom Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function getUserSavedTelecom(userId) {
    try {
      const response = await telecomApi.get(`/getUserSavedTelecom/${userId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("telecomRedux getUserSavedTelecom Error : ", error);
      return {status: false, data: error.message};
    }
}