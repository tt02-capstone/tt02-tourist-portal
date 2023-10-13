import { categoryApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function getAllCategories() {
    try {
        const response = await categoryApi.get(`/getAll`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("categoryRedux getAllCategories Error : ", error);
        return {status: false, data: error.message};
    }
}