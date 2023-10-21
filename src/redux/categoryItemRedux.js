import { categoryItemApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function getAllByCategoryId(categoryId) {
    try {
        console.log(categoryId);
        const response = await categoryItemApi.get(`/getAllByCategoryId/${categoryId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("categoryItemRedux getAllByCategoryId Error : ", error);
        return {status: false, data: error.message};
    }
}