import { recommendationApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function getRecommendation(location,listingType,typeId) {
    try {
        const response = await recommendationApi.get(`/getRecommendation/${location}/${listingType}/${typeId}`);
        return handleApiErrors(response);
    } catch (error) {
      console.error("recommendationRedux Error getRecommendation : ", error);
      return {status: false, data: error.message};
    }
}

export async function getRecommendationFromBookings(userId) {
    try {
        const response = await recommendationApi.get(`/getRecommendationFromBookings/${userId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("recommendationRedux Error getRecommendation : ", error);
        return {status: false, data: error.message};
    }
}


export async function getPostRecommendation(catItemId) {
  try {
      const response = await recommendationApi.get(`/getPostRecommendation/${catItemId}`);
      return handleApiErrors(response);
  } catch (error) {
    console.error("recommendationRedux getPostRecommendation : ", error);
    return {status: false, data: error.message};
  }
}