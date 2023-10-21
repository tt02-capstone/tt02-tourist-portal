import { commentApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function createComment(postId, parentCommentId, userId, comment) {
    try {
        const response = await commentApi.post(`/createComment/${postId}/${parentCommentId}/${userId}`, comment);
        return handleApiErrors(response);
    } catch (error) {
        console.error("commentRedux createComment Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function getAllPostComment(postId) {
    try {
        const response = await commentApi.get(`/getAllPostComment/${postId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("commentRedux getAllPostComment Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function updateComment(comment) {
    try {
        const response = await commentApi.put(`/updateComment`, comment);
        return handleApiErrors(response);
    } catch (error) {
        console.error("commentRedux updateComment Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function deleteComment(commentId) {
    try {
        const response = await commentApi.delete(`/deleteComment/${commentId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("commentRedux deleteComment Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function upvoteComment(userId, commentId) {
    try {
        const response = await commentApi.put(`/upvoteComment/${userId}/${commentId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("commentRedux upvoteComment Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function downvoteComment(userId, commentId) {
    try {
        const response = await commentApi.put(`/downvoteComment/${userId}/${commentId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("commentRedux downvoteComment Error : ", error);
        return {status: false, data: error.message};
    }
}
