import { cartApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function addTelecomToCart(userId, telecomId, cartBooking) {
  try {
    const response = await cartApi.post(`/addTelecomToCart/${userId}/${telecomId}`, cartBooking);
    return handleApiErrors(response);
  } catch (error) {
    console.error("cartRedux addTelecomToCart: ", error);
    return {status: false, data: error.message};
  }
}