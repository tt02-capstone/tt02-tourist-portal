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

export async function getTelecomRecommendations(itineraryId) {
  try {
    const response = await itineraryApi.get(`/getTelecomRecommendations/${itineraryId}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux getTelecomRecommendations Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function getAttractionRecommendationsByDate(itineraryId, dateTime) {
  try {
    console.log("HERE!!!")
    const response = await itineraryApi.get(`/getAttractionRecommendationsByDate/${itineraryId}/${dateTime}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux getAttractionRecommendationsByDate Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function getAccommodationRecommendationsForItinerary(itineraryId) {
  try {
    const response = await itineraryApi.get(`/getAccommodationRecommendationsForItinerary/${itineraryId}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux getAccommodationRecommendationsForItinerary Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function getRestaurantRecommendationsForItinerary(itineraryId, dateTime) {
  try {
    const response = await itineraryApi.get(`/getRestaurantRecommendationsForItinerary/${itineraryId}/${dateTime}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux getRestaurantRecommendationsForItinerary Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function getSuggestedEventsBasedOnTimeslot(startTime, endTime) {
  try {
    const response = await itineraryApi.get(`/getSuggestedEventsBasedOnTimeslot/${startTime}/${endTime}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux getSuggestedEventsBasedOnTimeslot Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function existingAccommodationInItinerary(itineraryId) {
  try {
    const response = await itineraryApi.get(`/existingAccommodationInItinerary/${itineraryId}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux existingAccommodationInItinerary Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function existingTelecomInItinerary(itineraryId) {
  try {
    const response = await itineraryApi.get(`/existingTelecomInItinerary/${itineraryId}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux existingTelecomInItinerary Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function getUserWithEmailSimilarity(masterUserId, itineraryId, email) {
  try {
    const response = await itineraryApi.get(`/getUserWithEmailSimilarity/${masterUserId}/${itineraryId}/${email}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux getUserWithEmailSimilarity Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function getInvitedUsers(itineraryId) {
  try {
    const response = await itineraryApi.get(`/getInvitedUsers/${itineraryId}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux getInvitedUsers Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function getAcceptedUsers(itineraryId) {
  try {
    const response = await itineraryApi.get(`/getAcceptedUsers/${itineraryId}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux getAcceptedUsers Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function toggleItineraryInvite(itineraryId, userIdToAddOrRemove) {
  try {
    const response = await itineraryApi.post(`/toggleItineraryInvite/${itineraryId}/${userIdToAddOrRemove}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("itineraryRedux toggleItineraryInvite Error : ", error);
    return {status: false, data: error.message};
  }
}