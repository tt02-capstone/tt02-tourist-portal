import { itineraryApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function getItineraryByUser(userId) {
    try {
      const response = await itineraryApi.get(`/getItineraryByUser/${userId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("itineraryRedux getItineraryByUser Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function createItinerary(userId, itineraryObj) {
  try {
    const response = await itineraryApi.post(`/createItinerary/${userId}`, itineraryObj);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux createItinerary Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function updateItinerary(itineraryId, itineraryObj) {
  try {
    const response = await itineraryApi.put(`/updateItinerary/${itineraryId}`, itineraryObj);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux updateItinerary Error : ", error);
    return {status: false, data: error.message};
  };
}

export async function deleteItinerary(userId, itineraryId) {
  try {
    const response = await itineraryApi.delete(`/deleteItinerary/${userId}/${itineraryId}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux deleteItinerary Error : ", error);
    return {status: false, data: error.message};
  }
}