import { categoryItemApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function createCategoryItem(categoryId, categoryItem) {
    try {
        const response = await categoryItemApi.post(`/createCategoryItem/${categoryId}`, categoryItem);
        return handleApiErrors(response);
    } catch (error) {
        console.error("categoryItemRedux createCategoryItem Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function getAllByCategoryId(categoryId) {
    try {
        const response = await categoryItemApi.get(`/getAllByCategoryId/${categoryId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("categoryItemRedux getAllByCategoryId Error : ", error);
        return {status: false, data: error.message};
    }
}