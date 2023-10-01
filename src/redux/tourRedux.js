import { tourApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";
import { format, addMinutes, parseISO } from 'date-fns';

export async function getAllTourTypesByAttraction(attractionId, dateSelected) {
    try {
        const response = await tourApi.get(`/getAllTourTypesByAttraction/${attractionId}/${dateSelected}`)
        return handleApiErrors(response);
    } catch (error) {
        console.error("tourRedux getAllTourTypesByAttraction Error : ", error);
        return {status: false, data: error.message};
      }
}