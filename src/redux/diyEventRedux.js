import { diyEventApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function createDiyEvent(itineraryId, typeId, type, diyEventToCreate) {
  try {
    const response = await diyEventApi.post(`/createDiyEvent/${itineraryId}/${typeId}/${type}`, diyEventToCreate);
    return handleApiErrors(response);
  } catch (error) {
    console.error("diyEventRedux createDiyEvent Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function updateDiyEvent(diyEventToUpdate) {
  try {
    const response = await diyEventApi.put(`/updateDiyEvent`, diyEventToUpdate);
    return handleApiErrors(response);
  } catch (error) {
    console.error("diyEventRedux updateDiyEvent Error : ", error);
    return {status: false, data: error.message};
  };
}

export async function deleteDiyEvent(diyEventIdToDelete) {
  try {
    const response = await diyEventApi.delete(`/deleteDiyEvent/${diyEventIdToDelete}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("diyEventRedux deleteDiyEvent Error : ", error);
    return {status: false, data: error.message};
  }
}