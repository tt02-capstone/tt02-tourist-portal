import { itemApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function retrieveAllItemsByVendor(vendorId) {
    try {
        const response = await itemApi.get(`/retrieveAllItemsByVendor/${vendorId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("itemRedux retrieveAllItemsByVendor Error : ", error);
        return { status: false, data: error.message };
    }
}

export async function retrieveItemById(itemId) {
    try {
      const response = await itemApi.get(`/retrieveItemById/${itemId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("itemRedux retrieveItemById Error: ", error);
      return { status: false, data: error.message };
    }
}

export async function retrieveAllPublishedItemsByVendor(vendorId) {
    try {
      const response = await itemApi.get(`/retrieveAllPublishedItemsByVendor/${vendorId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("itemRedux retrieveAllPublishedItemsByVendor Error: ", error);
      return { status: false, data: error.message };
    }
}

export async function retrieveAllPublishedItems() {
    try {
      const response = await itemApi.get(`/retrieveAllPublishedItems`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("itemRedux retrieveAllPublishedItems Error: ", error);
      return { status: false, data: error.message };
    }
}

export async function getItemVendor(itemId) {
    try {
      const response = await itemApi.get(`/getItemVendor/${itemId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("itemRedux getItemVendor Error: ", error);
      return { status: false, data: error.message };
    }
}



