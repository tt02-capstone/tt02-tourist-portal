import { reportApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function reportPost(postId, report) {
    try {
        const response = await reportApi.post(`/reportPost/${postId}`, report);
        return handleApiErrors(response);
    } catch (error) {
        console.error("reportRedux reportPost Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function reportComment(commentId, report) {
    try {
        const response = await reportApi.post(`/reportComment/${commentId}`, report);
        return handleApiErrors(response);
    } catch (error) {
        console.error("reportRedux reportreportCommentPost Error : ", error);
        return {status: false, data: error.message};
    }
}