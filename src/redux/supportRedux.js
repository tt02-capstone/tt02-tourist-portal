import { supportApi } from "../helpers/api";
import { handleApiErrors } from "../helpers/errorCatching";

export async function getAllSupportTicketsByUser(userId) {
    try {
      const response = await supportApi.get(`/getAllSupportTicketsByUser/${userId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("supportRedux getAllSupportTicketsByUser Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function getSupportTicket(supportTicketId) {
    try {
      const response = await supportApi.get(`/getSupportTicket/${supportTicketId}`);
      return handleApiErrors(response);
    } catch (error) {
      console.error("supportRedux getSupportTicket Error : ", error);
      return {status: false, data: error.message};
    }
}

export async function createSupportTicketToAdmin(userId, supportTicketObj) {
  try {
    const response = await supportApi.post(`/createSupportTicketToAdmin/${userId}`, supportTicketObj);
    return handleApiErrors(response);
  } catch (error) {
    console.error("supportRedux createSupportTicketToAdmin Error : ", error);
    return {status: false, data: error.message};
  };
}

export async function createSupportTicketToVendor(userId, activityId, supportTicketObj) {
  try {
    const response = await supportApi.post(`/createSupportTicketToVendor/${userId}/${activityId}`, supportTicketObj);
    return handleApiErrors(response);
  } catch (error) {
    console.error("supportRedux createSupportTicketToVendor Error : ", error);
    return {status: false, data: error.message};
  };
}

export async function createSupportTicketForBooking(userId, bookingId, supportTicketObj) {
  try {
    const response = await supportApi.post(`/createSupportTicketForBooking/${userId}/${bookingId}`, supportTicketObj);
    return handleApiErrors(response);
  } catch (error) {
    console.error("supportRedux createSupportTicketForBooking Error : ", error);
    return {status: false, data: error.message};
  };
}

export async function updateSupportTicket(supportTicketId, supportTicketObj) {
  try {
    const response = await supportApi.put(`/updateSupportTicket/${supportTicketId}`, supportTicketObj);
    return handleApiErrors(response);
  } catch (error) {
    console.error("supportRedux updateSupportTicket Error : ", error);
    return {status: false, data: error.message};
  };
}

export async function updateSupportTicketStatus(supportTicketId) {
  try {
    const response = await supportApi.put(`/updateSupportTicketStatus/${supportTicketId}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("supportRedux updateSupportTicketStatus Error : ", error);
    return {status: false, data: error.message};
  };
}

export async function deleteSupportTicket(supportTicketId) {
  try {
    const response = await supportApi.delete(`/deleteSupportTicket/${supportTicketId}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("supportRedux getSupportTicket Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function getAllRepliesBySupportTicket(supportTicketId) {
  try {
    const response = await supportApi.get(`/getAllRepliesBySupportTicket/${supportTicketId}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("supportRedux getAllRepliesBySupportTicket Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function getReplyById(replyId) {
  try {
    const response = await supportApi.get(`/getReplyById/${replyId}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("supportRedux getReplyById Error : ", error);
    return {status: false, data: error.message};
  }
}

export async function createReply(userId, supportTicketId, replyObj) {
  try {
    const response = await supportApi.post(`/createReply/${userId}/${supportTicketId}`, replyObj);
    return handleApiErrors(response);
  } catch (error) {
    console.error("supportRedux createReply Error : ", error);
    return {status: false, data: error.message};
  };
}

export async function updateReply(replyId, replyObj) {
  try {
    const response = await supportApi.put(`/updateReply/${replyId}`, replyObj);
    return handleApiErrors(response);
  } catch (error) {
    console.error("supportRedux updateReply Error : ", error);
    return {status: false, data: error.message};
  };
}

export async function deleteReply(supportTicketId, replyId) {
  try {
    const response = await supportApi.delete(`/deleteReply/${supportTicketId}/${replyId}`);
    return handleApiErrors(response);
  } catch (error) {
    console.error("supportRedux deleteReply Error : ", error);
    return {status: false, data: error.message};
  }
}
