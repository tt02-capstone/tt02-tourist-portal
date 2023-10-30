import axios from 'axios';
import { notificationApi } from '../helpers/api';
import { handleApiErrors } from '../helpers/errorCatching';

export async function sendNotification(userId, date) {
    try {
        const response = await notificationApi.post(`/sendNotification/${userId}`, {date: date});
        return handleApiErrors(response);
    } catch (error) {
        console.error("notificationRedux sendNotification Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function getUserNotification(userId) {
    try {
        const response = await notificationApi.get(`/getUserNotification/${userId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("notificationRedux getUserNotification Error : ", error);
        return {status: false, data: error.message};
    }
}

export async function updateNotification(notificationId) {
    try {
        const response = await notificationApi.put(`/updateNotification/${notificationId}`);
        return handleApiErrors(response);
    } catch (error) {
        console.error("notificationRedux updateNotification Error : ", error);
        return {status: false, data: error.message};
    }
}

// export async function sendNotification(title, body) {
//     axios.post('https://app.nativenotify.com/api/notification', {
//         appId: 13960,
//         appToken: "BEbA270k2T53VV6Cu8pZIZ",
//         title: title,
//         body: body,
//         dateSent: "10-25-2023 3:14PM",
//     })
//     .then(function (response) {
//         console.log("success");
//         return {status: true, data: ''}
//     })
//     .catch(function (error) {
//         console.error("notificationRedux sendNotification: ", error);
//         return {status: false, data: error.message};
//     });
// }