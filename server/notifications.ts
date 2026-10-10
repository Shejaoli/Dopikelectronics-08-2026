import nodemailer from "nodemailer";
import webpush from "web-push";
import { storage } from "./storage";
import type { Order, Customer } from "@shared/schema";

// ---------------------------------------------------------------------------
// This module is intentionally fail-safe: if email or push isn't configured
// yet (missing env vars), it logs a warning ONCE and skips silently. It must
// NEVER throw, and must NEVER block or break the order/registration request
// that triggered it. Callers should always invoke these with .catch() and
// never await them inline in the critical request path.
// ---------------------------------------------------------------------------

let warnedMissingEmailConfig = false;
let warnedMissingCustomerEmailConfig = false;
let warnedMissingVapidConfig = false;
let vapidConfigured = false;

function getEmailTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    if (!warnedMissingEmailConfig) {
      console.warn("[notifications] GMAIL_USER / GMAIL_APP_PASSWORD not set — email notifications are disabled.");
      warnedMissingEmailConfig = true;
    }
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function getCustomerEmailTransport() {
  const user = process.env.CUSTOMER_GMAIL_USER || "dopikelectronics@gmail.com";
  const pass = process.env.CUSTOMER_GMAIL_APP_PASSWORD;
  if (!pass) {
    if (!warnedMissingCustomerEmailConfig) {
      console.warn("[notifications] CUSTOMER_GMAIL_APP_PASSWORD not set — customer email notifications are disabled.");
      warnedMissingCustomerEmailConfig = true;
    }
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    if (!warnedMissingVapidConfig) {
      console.warn("[notifications] VAPID keys not set — browser push notifications are disabled.");
      warnedMissingVapidConfig = true;
    }
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

async function notifyAdminsByEmail(subject: string, html: string): Promise<void> {
  try {
    const transport = getEmailTransport();
    if (!transport) return;
    const admins = await storage.getAdmins();
    const recipients = admins.map(a => a.email).filter(Boolean);
    if (recipients.length === 0) return;
    await transport.sendMail({
      from: process.env.GMAIL_USER,
      to: recipients.join(", "),
      subject,
      html,
    });
  } catch (error) {
    console.error("[notifications] Failed to send admin email:", error);
  }
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (character) => entities[character] || character);
}

function getCustomerPaymentStatus(order: Order): string {
  if (order.paymentMethod === "MTN Mobile Money") {
    if (order.paymentState === "SUCCEEDED") return "Paid";
    if (order.paymentState === "FAILED" || order.paymentState === "CANCELLED") return "Not completed";
    return "Awaiting confirmation";
  }
  if (order.status === "paid" || order.status === "processing" || order.status === "shipped" || order.status === "completed") {
    return "Paid";
  }
  if (order.paymentMethod === "Cash on Delivery") return "Due on delivery";
  return "Awaiting confirmation";
}

function renderOrderSummary(order: Order): string {
  const rows = (order.items || []).map((item) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(item.name)}${item.storage ? ` (${escapeHtml(item.storage)})` : ""}${item.color ? ` / ${escapeHtml(item.color)}` : ""}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${(item.price * item.quantity).toLocaleString()} ${escapeHtml(order.currency)}</td>
    </tr>
  `).join("");
  const tracking = order.trackingCode ? escapeHtml(order.trackingCode) : `#${order.id}`;

  return `
    <p><strong>Order:</strong> ${tracking}</p>
    <p><strong>Order status:</strong> ${escapeHtml(order.status)}</p>
    <p><strong>Payment status:</strong> ${escapeHtml(getCustomerPaymentStatus(order))}</p>
    <p><strong>Payment method:</strong> ${escapeHtml(order.paymentMethod || "Not specified")}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead><tr>
        <th style="padding:8px;text-align:left;border-bottom:1px solid #d1d5db">Item</th>
        <th style="padding:8px;text-align:center;border-bottom:1px solid #d1d5db">Qty</th>
        <th style="padding:8px;text-align:right;border-bottom:1px solid #d1d5db">Amount</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p><strong>Delivery:</strong> ${(order.deliveryFee || 0).toLocaleString()} ${escapeHtml(order.currency)}</p>
    <p style="font-size:18px"><strong>Total:</strong> ${order.totalAmount.toLocaleString()} ${escapeHtml(order.currency)}</p>
    ${order.trackingCode ? `<p>You can check your order status using tracking code <strong>${tracking}</strong> and the phone number used at checkout.</p>` : ""}
  `;
}

async function sendCustomerEmail(order: Order, subject: string, heading: string, message: string): Promise<void> {
  if (!order.customerEmail) return;
  try {
    const transport = getCustomerEmailTransport();
    if (!transport) return;
    await transport.sendMail({
      from: process.env.CUSTOMER_GMAIL_USER || "dopikelectronics@gmail.com",
      to: order.customerEmail,
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;color:#111827;max-width:640px;margin:0 auto">
          <h2>${escapeHtml(heading)}</h2>
          <p>Hello ${escapeHtml(order.customerName)},</p>
          <p>${escapeHtml(message)}</p>
          ${renderOrderSummary(order)}
          <p>Thank you for shopping with DOPIK Electronics.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[notifications] Failed to send customer order email:", error);
  }
}

export async function notifyCustomerOrderConfirmation(order: Order): Promise<void> {
  await sendCustomerEmail(
    order,
    `Order confirmation${order.trackingCode ? ` — ${order.trackingCode}` : ""}`,
    "We received your order",
    "This is your order confirmation and invoice summary. We will email you when your payment or order status changes."
  );
}

export async function notifyCustomerPaymentStatus(order: Order): Promise<void> {
  if (order.paymentState !== "SUCCEEDED" && order.paymentState !== "FAILED" && order.paymentState !== "CANCELLED") return;
  const completed = order.paymentState === "SUCCEEDED";
  await sendCustomerEmail(
    order,
    `Payment ${completed ? "completed" : "not completed"}${order.trackingCode ? ` — ${order.trackingCode}` : ""}`,
    completed ? "Payment confirmed" : "Payment was not completed",
    completed
      ? "The payment provider has confirmed your payment."
      : "The payment provider did not confirm a completed payment. Please do not assume the order is paid; contact us if you believe you were charged."
  );
}

export async function notifyCustomerOrderStatus(order: Order): Promise<void> {
  await sendCustomerEmail(
    order,
    `Order status: ${order.status}${order.trackingCode ? ` — ${order.trackingCode}` : ""}`,
    `Your order is ${order.status}`,
    `Your order status has been updated to ${order.status}.`
  );
}

async function notifyAdminsByPush(title: string, body: string, url: string): Promise<void> {
  try {
    if (!ensureVapidConfigured()) return;
    const subscriptions = await storage.getAllPushSubscriptions();
    if (subscriptions.length === 0) return;
    const payload = JSON.stringify({ title, body, url });
    await Promise.all(subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
      } catch (error: any) {
        // Clean up subscriptions the browser has revoked or that have expired
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await storage.deletePushSubscriptionByEndpoint(sub.endpoint).catch(() => {});
        } else {
          console.error("[notifications] Push send failed for one subscription:", error);
        }
      }
    }));
  } catch (error) {
    console.error("[notifications] Failed to send admin push notifications:", error);
  }
}

export async function notifyNewOrder(order: Order): Promise<void> {
  const amount = `${order.totalAmount.toLocaleString()} RWF`;
  const subject = `New order from ${order.customerName} — ${amount}`;
  const html = `
    <h2>New order received</h2>
    <p><strong>Customer:</strong> ${order.customerName}</p>
    <p><strong>Phone:</strong> ${order.customerPhone}</p>
    <p><strong>Total:</strong> ${amount}</p>
    ${order.trackingCode ? `<p><strong>Tracking code:</strong> ${order.trackingCode}</p>` : ""}
  `;
  await Promise.all([
    notifyAdminsByEmail(subject, html),
    notifyAdminsByPush("New order", `${order.customerName} — ${amount}`, "/admin/orders"),
  ]);
}

export async function notifyNewCustomer(customer: Customer): Promise<void> {
  const subject = `New customer registered — ${customer.fullName}`;
  const html = `
    <h2>New customer account created</h2>
    <p><strong>Name:</strong> ${customer.fullName}</p>
    <p><strong>Email:</strong> ${customer.email}</p>
    <p><strong>Phone:</strong> ${customer.phone || "—"}</p>
  `;
  await Promise.all([
    notifyAdminsByEmail(subject, html),
    notifyAdminsByPush("New customer", `${customer.fullName} just signed up`, "/admin/customers"),
  ]);
}
