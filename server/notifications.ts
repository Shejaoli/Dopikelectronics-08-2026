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
