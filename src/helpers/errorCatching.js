export async function handleApiErrors(response) {
    if (response.data.httpStatusCode === 400 || response.data.httpStatusCode === 404 || response.data.httpStatusCode === 422) {
        return { status: false, data: response.data };
    } else {
        return { status: true, data: response.data };
    }
}