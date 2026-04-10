/**
 * Email Service Hook - Mailjet via Supabase Edge Function
 */

import { supabase } from "@/lib/supabase";
import { generateEmailHTML, getEmailSubject } from "./EmailTemplate";

const SUPABASE_URL = "https://pnhiuifejnnklbfpjmdr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuaGl1aWZlam5ua2xiZnBqbWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTA3ODUsImV4cCI6MjA4OTI2Njc4NX0.PSnt0z41OiiUvoJgp3S5WO5g8Mhz-GORZbExlo_SXho";

const sendMailjet = async (to_email, to_name, subject, html_content) => {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ to_email, to_name, subject, html_content })
    });
    const data = await res.json();
    console.log("Email sent:", data);
    return { success: true };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: error.message };
  }
};

export const useEmailService = () => {
  const sendEmail = async (templateType, userData, emailData) => {
    const subject = getEmailSubject(templateType, emailData);
    const html_content = generateEmailHTML(templateType, emailData);
    const to_email = userData.email;
    const to_name = userData.full_name || userData.firstName || "";
    return sendMailjet(to_email, to_name, subject, html_content);
  };

  return {
    sendSignupConfirmation: async (user) =>
      sendEmail("signup_confirmation", user, {
        firstName: user.full_name?.split(" ")[0] || "Utilisateur"
      }),

    sendListingPublished: async (user, product) =>
      sendEmail("listing_published", user, {
        firstName: user.full_name?.split(" ")[0] || "Utilisateur",
        productTitle: product.title,
        productId: product.id,
        price: product.price,
        condition: product.condition,
        category: product.category
      }),

    sendNewOrderSeller: async (seller, order, product) =>
      sendEmail("new_order_seller", seller, {
        firstName: seller.full_name?.split(" ")[0] || "Vendeur",
        productTitle: product.title,
        price: product.price,
        buyerName: order.buyer_name,
        orderId: order.id
      }),

    sendOrderConfirmationBuyer: async (buyer, order, product, seller) =>
      sendEmail("order_confirmation_buyer", buyer, {
        firstName: buyer.full_name?.split(" ")[0] || "Acheteur",
        productTitle: product.title,
        sellerName: seller?.full_name || seller?.seller_name || "",
        totalPrice: order.total_paid || order.price,
        orderId: order.id
      }),

    sendOrderPreparing: async (buyer, order, product) =>
      sendEmail("order_preparing", buyer, {
        firstName: buyer.full_name?.split(" ")[0] || "Acheteur",
        productTitle: product.title,
        orderId: order.id
      }),

    sendOrderShipped: async (buyer, order, product, shippingInfo) =>
      sendEmail("order_shipped", buyer, {
        firstName: buyer.full_name?.split(" ")[0] || "Acheteur",
        productTitle: product.title,
        carrier: shippingInfo?.carrier || "En attente",
        trackingNumber: order.tracking_number || "En attente",
        estimatedDelivery: shippingInfo?.estimatedDelivery || "3-7 jours ouvrables",
        orderId: order.id
      }),

    sendOrderDelivered: async (buyer, order, product) =>
      sendEmail("order_delivered", buyer, {
        firstName: buyer.full_name?.split(" ")[0] || "Acheteur",
        productTitle: product.title,
        orderId: order.id
      }),

    sendNewMessageNotification: async (recipient, messageData) =>
      sendEmail("new_message", recipient, {
        firstName: recipient.full_name?.split(" ")[0] || "Utilisateur",
        senderName: messageData.senderName,
        productTitle: messageData.productTitle,
        messagePreview: messageData.messagePreview?.substring(0, 100) + "..."
      }),

    sendRefundProcessed: async (user, refundData) =>
      sendEmail("refund_processed", user, {
        firstName: user.full_name?.split(" ")[0] || "Utilisateur",
        refundAmount: refundData.amount,
        refundReason: refundData.reason || "Demande acceptée"
      }),

    sendSupportReply: async (user, supportData) =>
      sendEmail("support_reply", user, {
        firstName: user.full_name?.split(" ")[0] || "Utilisateur",
        subject: supportData.subject,
        priority: supportData.priority || "Normal"
      }),
  };
};
