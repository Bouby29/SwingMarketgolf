/**
 * Email Service Hook - Handles automated email sending
 * Integrates with Base44 SendEmail API and stores history
 */

import { supabase as base44 } from "@/lib/supabase";
import { generateEmailHTML, getEmailSubject } from "./EmailTemplate";

export const useEmailService = () => {
  /**
   * Send email and store in history
   */
  const sendEmail = async (templateType, userData, emailData) => {
    try {
      const subject = getEmailSubject(templateType, emailData);
      const htmlContent = generateEmailHTML(templateType, emailData);

      // Send email via base44 integration
      await base44.integrations.Core.SendEmail({
        to: userData.email,
        subject: subject,
        body: htmlContent
      });

      // Store in email history
      await base44.entities.EmailHistory.create({
        user_email: userData.email,
        user_name: userData.full_name || userData.firstName || "User",
        email_type: templateType,
        subject: subject,
        content: htmlContent,
        related_product_id: emailData.productId || null,
        related_order_id: emailData.orderId || null,
        status: "sent",
        metadata: emailData
      });

      return { success: true };
    } catch (error) {
      console.error(`Error sending ${templateType} email:`, error);

      // Store failed email in history
      try {
        const subject = getEmailSubject(templateType, emailData);
        const htmlContent = generateEmailHTML(templateType, emailData);

        await base44.entities.EmailHistory.create({
          user_email: userData.email,
          user_name: userData.full_name || userData.firstName || "User",
          email_type: templateType,
          subject: subject,
          content: htmlContent,
          related_product_id: emailData.productId || null,
          related_order_id: emailData.orderId || null,
          status: "failed",
          metadata: { ...emailData, error: error.message }
        });
      } catch (historyError) {
        console.error("Failed to store email history:", historyError);
      }

      return { success: false, error: error.message };
    }
  };

  return {
    /**
     * Send signup confirmation email
     */
    sendSignupConfirmation: async (user) => {
      return sendEmail("signup_confirmation", user, {
        firstName: user.full_name?.split(" ")[0] || "User"
      });
    },

    /**
     * Send listing published email
     */
    sendListingPublished: async (user, product) => {
      return sendEmail("listing_published", user, {
        firstName: user.full_name?.split(" ")[0] || "User",
        productTitle: product.title,
        productId: product.id,
        price: product.price,
        condition: product.condition,
        category: product.category
      });
    },

    /**
     * Send new order email to seller
     */
    sendNewOrderSeller: async (seller, order, product) => {
      return sendEmail("new_order_seller", seller, {
        firstName: seller.full_name?.split(" ")[0] || "User",
        productTitle: product.title,
        price: product.price,
        buyerName: order.buyer_name,
        orderId: order.id
      });
    },

    /**
     * Send order confirmation email to buyer
     */
    sendOrderConfirmationBuyer: async (buyer, order, product, seller) => {
      return sendEmail("order_confirmation_buyer", buyer, {
        firstName: buyer.full_name?.split(" ")[0] || "User",
        productTitle: product.title,
        sellerName: seller.full_name || seller.seller_name,
        totalPrice: order.total_paid,
        orderId: order.id
      });
    },

    /**
     * Send order preparing email
     */
    sendOrderPreparing: async (buyer, order, product) => {
      return sendEmail("order_preparing", buyer, {
        firstName: buyer.full_name?.split(" ")[0] || "User",
        productTitle: product.title,
        orderId: order.id
      });
    },

    /**
     * Send order shipped email
     */
    sendOrderShipped: async (buyer, order, product, shippingInfo) => {
      return sendEmail("order_shipped", buyer, {
        firstName: buyer.full_name?.split(" ")[0] || "User",
        productTitle: product.title,
        carrier: shippingInfo?.carrier || "En attente",
        trackingNumber: order.tracking_number || "En attente",
        estimatedDelivery: shippingInfo?.estimatedDelivery || "3-7 jours ouvrables",
        orderId: order.id
      });
    },

    /**
     * Send order delivered email
     */
    sendOrderDelivered: async (buyer, order, product) => {
      return sendEmail("order_delivered", buyer, {
        firstName: buyer.full_name?.split(" ")[0] || "User",
        productTitle: product.title,
        orderId: order.id
      });
    },

    /**
     * Send refund processed email
     */
    sendRefundProcessed: async (user, refundData) => {
      return sendEmail("refund_processed", user, {
        firstName: user.full_name?.split(" ")[0] || "User",
        refundAmount: refundData.amount,
        refundReason: refundData.reason || "Demande de remboursement acceptée"
      });
    },

    /**
     * Send support reply email
     */
    sendSupportReply: async (user, supportData) => {
      return sendEmail("support_reply", user, {
        firstName: user.full_name?.split(" ")[0] || "User",
        subject: supportData.subject,
        priority: supportData.priority || "Normal"
      });
    },

    /**
     * Send new message notification
     */
    sendNewMessageNotification: async (recipient, messageData) => {
      return sendEmail("new_message", recipient, {
        firstName: recipient.full_name?.split(" ")[0] || "User",
        senderName: messageData.senderName,
        productTitle: messageData.productTitle,
        messagePreview: messageData.messagePreview?.substring(0, 100) + "..."
      });
    }
  };
};