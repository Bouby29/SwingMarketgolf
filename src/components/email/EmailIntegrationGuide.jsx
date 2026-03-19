/**
 * Email Integration Guide
 * 
 * USAGE EXAMPLES:
 * 
 * 1. AFTER USER SIGNUP (in your auth/registration component):
 * ═══════════════════════════════════════════════════════════
 * import { useEmailService } from "@/components/email/useEmailService";
 * 
 * const { sendSignupConfirmation } = useEmailService();
 * const user = await Promise.resolve(null);
 * await sendSignupConfirmation(user);
 * 
 * 
 * 2. AFTER LISTING PUBLICATION (in CreateListing page):
 * ════════════════════════════════════════════════════
 * import { useEmailService } from "@/components/email/useEmailService";
 * 
 * const { sendListingPublished } = useEmailService();
 * const user = await base44.auth.me();
 * const product = await base44.entities.Product.get(productId);
 * await sendListingPublished(user, product);
 * 
 * 
 * 3. AFTER ORDER CREATED (in Checkout/ProductDetail):
 * ═════════════════════════════════════════════════════
 * import { useEmailService } from "@/components/email/useEmailService";
 * 
 * const { sendNewOrderSeller, sendOrderConfirmationBuyer } = useEmailService();
 * const buyer = await base44.auth.me();
 * const product = await base44.entities.Product.get(productId);
 * const seller = await base44.entities.User.get(product.seller_id);
 * const order = await base44.entities.Order.create(orderData);
 * 
 * // Send to seller
 * await sendNewOrderSeller(seller, order, product);
 * 
 * // Send to buyer
 * await sendOrderConfirmationBuyer(buyer, order, product, seller);
 * 
 * 
 * 4. WHEN ORDER STATUS CHANGES (in Dashboard/AdminPanel):
 * ══════════════════════════════════════════════════════
 * import { useEmailService } from "@/components/email/useEmailService";
 * 
 * const {
 *   sendOrderPreparing,
 *   sendOrderShipped,
 *   sendOrderDelivered
 * } = useEmailService();
 * 
 * const buyer = await base44.entities.User.get(order.buyer_id);
 * const product = await base44.entities.Product.get(order.product_id);
 * 
 * // When status changed to "preparing"
 * if (newStatus === "preparing") {
 *   await sendOrderPreparing(buyer, order, product);
 * }
 * 
 * // When status changed to "shipped"
 * if (newStatus === "shipped") {
 *   const shippingInfo = {
 *     carrier: "Chronopost",
 *     estimatedDelivery: "3-5 jours ouvrables"
 *   };
 *   await sendOrderShipped(buyer, order, product, shippingInfo);
 * }
 * 
 * // When status changed to "delivered"
 * if (newStatus === "delivered") {
 *   await sendOrderDelivered(buyer, order, product);
 * }
 * 
 * 
 * 5. ON MESSAGE RECEIVED (in Messages component):
 * ════════════════════════════════════════════════
 * import { useEmailService } from "@/components/email/useEmailService";
 * 
 * const { sendNewMessageNotification } = useEmailService();
 * const recipient = await base44.entities.User.get(receiverId);
 * 
 * const messageData = {
 *   senderName: senderName,
 *   productTitle: productTitle,
 *   messagePreview: messageContent
 * };
 * 
 * await sendNewMessageNotification(recipient, messageData);
 * 
 * 
 * 6. VIEW EMAIL HISTORY (add to Dashboard):
 * ═════════════════════════════════════════
 * import EmailHistoryPanel from "@/components/email/EmailHistoryPanel";
 * 
 * <EmailHistoryPanel />
 * 
 * 
 * EMAIL ENTITY SCHEMA:
 * ══════════════════
 * EmailHistory contains:
 * - user_email: email of recipient
 * - user_name: recipient's name
 * - email_type: one of the 10 types
 * - subject: email subject line
 * - content: HTML content
 * - related_product_id: product involved (optional)
 * - related_order_id: order involved (optional)
 * - status: "sent" or "failed"
 * - metadata: additional data (prices, carrier, etc.)
 * - created_date: timestamp (automatic)
 * 
 * 
 * TESTING EMAILS:
 * ═══════════════
 * You can test each email type by:
 * 1. Using console to call the methods manually
 * 2. Checking EmailHistoryPanel component for history
 * 3. Verifying HTML output matches your branding
 * 
 */

export default function EmailIntegrationGuide() {
  return null;
}