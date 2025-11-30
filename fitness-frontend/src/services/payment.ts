import api from '../config/api';

export interface CreateInvoiceRequest {
  telegramId: string;
  amount?: number; // Optional, defaults to 10 stars
}

export interface CreateInvoiceResponse {
  invoiceUrl: string;
  amount: number;
}

export const paymentService = {
  /**
   * Create an invoice for Telegram Stars donation
   */
  createInvoice: async (data: CreateInvoiceRequest): Promise<CreateInvoiceResponse> => {
    const response = await api.post('/payments/create-invoice', data);
    return response.data;
  },
};



