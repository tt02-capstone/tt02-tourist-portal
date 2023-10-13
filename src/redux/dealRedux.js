import {dealsApi, dealApi} from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function getPublishedDealList() {
    try {
      const response = await dealsApi.get(`/getPublishedDealList`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("dealRedux getPublishedDealList Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function getdDealListbyVendor(vendorId) {
    try {
        const response = await dealsApi.get(`/getVendorDealList/${vendorId}`);
        console.log(response)
        return handleApiErrors(response);
    } catch (error) {
        console.error("dealRedux getAssociatedDealList Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function getDealById(id) {
    try {
      const response = await dealsApi.get(`/getDealById/${id}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("dealRedux getDealById Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function toggleSaveDeal(userId, dealId) {
    try {
      const response = await dealsApi.put(`/toggleSaveDeal/${userId}/${dealId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("dealRedux toggleSaveDeal Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function getUserSavedDeal(userId) {
    try {
      const response = await dealsApi.get(`/getUserSavedDeal/${userId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("dealRedux getUserSavedDeal Error : ", error);
      return {status: false, data: error.message};
    }
}