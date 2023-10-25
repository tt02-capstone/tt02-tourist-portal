import axios from 'axios';

export async function sendNotification(title, body) {

    axios.post('https://app.nativenotify.com/api/notification', {
        appId: 13960,
        appToken: "BEbA270k2T53VV6Cu8pZIZ",
        title: title,
        body: body,
        dateSent: "10-25-2023 3:14PM",
    })
    .then(function (response) {
        console.log("success");
        return {status: true, data: ''}
    })
    .catch(function (error) {
        console.error("notificationRedux sendNotification: ", error);
        return {status: false, data: error.message};
    });
}

// POST message
// https://app.nativenotify.com/api/notification

// {
//     appId: 13960,
//     appToken: "BEbA270k2T53VV6Cu8pZIZ",
//     title: "Push title here as a string",
//     body: "Push message here as a string",
//     dateSent: "10-25-2023 3:14PM",
//     pushData: { yourProperty: "yourPropertyValue" }, // optional
//     bigPictureURL: Big picture URL as a string // optional
// }