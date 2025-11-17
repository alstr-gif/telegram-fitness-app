import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';

const router = Router();
const paymentController = new PaymentController();

// Create invoice for Telegram Stars donation
router.post('/create-invoice', paymentController.createInvoice);

// Webhook for payment updates (optional, for analytics)
router.post('/webhook', paymentController.handlePaymentWebhook);

export default router;

