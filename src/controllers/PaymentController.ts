import { Request, Response } from 'express';
import { env } from '../config/env';

export class PaymentController {
  private botToken: string;
  private botApiUrl: string;

  constructor() {
    this.botToken = env.TELEGRAM_BOT_TOKEN;
    this.botApiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Create an invoice for Telegram Stars donation
   * POST /api/payments/create-invoice
   */
  createInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId, amount = 10 } = req.body;

      if (!telegramId) {
        res.status(400).json({ error: 'telegramId is required' });
        return;
      }

      // Validate amount (minimum 1 star, maximum 10000 stars)
      const starsAmount = Math.max(1, Math.min(10000, parseInt(String(amount), 10) || 10));

      // Create invoice using Telegram Bot API directly via HTTP
      // Currency "XTR" is for Telegram Stars
      // Amount is in the smallest currency unit (for Stars, 1 star = 100 units)
      const invoicePayload = {
        title: '⭐ Support Fitness App',
        description: 'Thank you for supporting our fitness app! Your contribution helps us grow and improve. 🌱',
        payload: `donation_${telegramId}_${Date.now()}`,
        provider_token: '', // Not needed for Telegram Stars
        currency: 'XTR', // Telegram Stars currency code
        prices: [
          {
            label: `${starsAmount} Telegram Stars`,
            amount: starsAmount, // For XTR, amount is directly in stars (not multiplied by 100)
          },
        ],
        // Optional: Add provider data
        provider_data: JSON.stringify({
          telegramId,
          type: 'donation',
        }),
      };

      // Call Telegram Bot API to create invoice link using fetch
      const response = await fetch(`${this.botApiUrl}/createInvoiceLink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoicePayload),
      });

      const data = await response.json() as { ok: boolean; result?: string; description?: string };

      if (data.ok && data.result) {
        res.json({
          invoiceUrl: data.result,
          amount: starsAmount,
        });
      } else {
        throw new Error(data.description || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json({
        error: 'Failed to create invoice',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Handle successful payment (webhook from Telegram)
   * This endpoint should be configured in BotFather
   * POST /api/payments/webhook
   */
  handlePaymentWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      // Telegram sends payment updates via webhook
      // This is handled automatically by the bot's pre_checkout_query and successful_payment events
      // But we can log it here for analytics
      console.log('Payment webhook received:', req.body);
      res.json({ status: 'ok' });
    } catch (error) {
      console.error('Error handling payment webhook:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  };
}

