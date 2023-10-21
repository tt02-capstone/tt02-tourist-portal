import { postApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function createPost(userId, categoryItemId, post) {
    try {
        const response = await postApi.post(`/createPost/${userId}/${categoryItemId}`, post);
        return handleApiErrors(response);
    } catch (error) {
        console.error("postRedux createPost Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function getAllPostByCategoryItemId(categoryItemId) {
    try {
        const response = await postApi.get(`/getAllPostByCategoryItemId/${categoryItemId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("postRedux getAllPostByCategoryItemId Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function getPost(postId) {
    try {
        const response = await postApi.get(`/getPost/${postId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("postRedux getPost Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function updatePost(post) {
    console.log("redux ", post);
    try {
        const response = await postApi.put(`/updatePost`, post);
        return handleApiErrors(response);
    } catch (error) {
        console.error("postRedux updatePost Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function deletePost(postId) {
    try {
        const response = await postApi.delete(`/deletePost/${postId}`,);
        return handleApiErrors(response);
    } catch (error) {
        console.error("postRedux deletePost Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function upvote(userId, postId) {
    try {
        const response = await postApi.put(`/upvote/${userId}/${postId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("postRedux upvote Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function downvote(userId, postId) {
    try {
        const response = await postApi.put(`/downvote/${userId}/${postId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("postRedux downvote Error : ", error);
        return {status: false, data: error.message};
    }
}