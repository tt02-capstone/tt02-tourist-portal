import { restaurantApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function getRestaurantList() {
    try {
      const response = await restaurantApi.get(`/getAllPublishedRestaurant`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("restRedux getAllPublishedRestaurant Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function getRestaurantById(restId) {
    try {
      const response = await restaurantApi.get(`/getRestaurant/${restId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("restRedux getRestaurantById Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function getRestaurantDish(restId) {
    try {
      const response = await restaurantApi.get(`/getRestaurantDish/${restId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("restRedux getRestaurantDish Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function getAllSavedRestaurantForUser(userId) {
    try {
      const response = await restaurantApi.get(`/getAllSavedRestaurantForUser/${userId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("restaurantApi getAllSavedRestaurantForUser Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function saveRestaurantForUser(userId, restId) {
    try {
      const response = await restaurantApi.put(`/saveRestaurantForUser/${userId}/${restId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("restaurantApi saveRestaurantForUser Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function removeSavedRestaurantForUser(userId, restId) {
    try {
      const response = await restaurantApi.delete(`/removeSavedRestaurantForUser/${userId}/${restId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("restaurantApi removeSavedRestaurantForUser Error : ", error);
      return {status: false, data: error.message};
    }
}