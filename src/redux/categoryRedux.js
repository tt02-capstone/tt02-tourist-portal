import { categoryApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function createCategory(category) {
    try {
        const response = await categoryApi.post(`/create`, category);
        return handleApiErrors(response);
    } catch (error) {
        console.error("categoryRedux createCategory Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function getAllCategories() {
    try {
        const response = await categoryApi.get(`/getAll`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("categoryRedux getAllCategories Error : ", error);
        return {status: false, data: error.message};
    }
}