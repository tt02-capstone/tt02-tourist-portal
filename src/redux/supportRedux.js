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