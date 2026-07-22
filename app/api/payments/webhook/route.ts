/**
 * Stripe Webhook Handler
 * POST /api/payments/webhook — handle Stripe webhook events
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  getStripe,
  getWebhookSecret,
  isStripeConfigured,
  Stripe,
} from "@/lib/stripe";
import { prisma } from "@/prisma/client";
import { ensureInvoiceForPaidOrder } from "@/prisma/invoice";
import {
  fromStripeMinorUnits,
  resolveTransactionCurrency,
  toStripeMinorUnits,
} from "@/lib/money";

/**
 * Disable body parsing for webhook verification
 */
export const runtime = "nodejs";

/**
 * POST /api/payments/webhook
 * Handles Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      logger.warn("Stripe webhook received but Stripe is not configured");
      return NextResponse.json(
        { error: "Payment system is not configured" },
        { status: 503 },
      );
    }

    const stripe = getStripe();
    const webhookSecret = getWebhookSecret();

    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      logger.error("Missing Stripe signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logger.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    logger.info(`Received Stripe webhook: ${event.type}`);

    // Handle specific event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.info(`PaymentIntent succeeded: ${paymentIntent.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.warn(`PaymentIntent failed: ${paymentIntent.id}`);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata) {
    logger.warn("Checkout session has no metadata");
    return;
  }

  const { type, referenceId, orderId, invoiceId } = metadata;

  logger.info(
    `Checkout completed for ${type} ${referenceId || orderId || invoiceId}`,
  );

  if (type === "order" && (orderId || referenceId)) {
    const orderIdToUpdate = orderId || referenceId;

    // Update order payment status and confirm order
    const order = await prisma.order.findUnique({
      where: { id: orderIdToUpdate },
      include: { items: true },
    });

    if (order && order.paymentStatus !== "paid") {
      const currency = resolveTransactionCurrency(order.currency);
      const amountMinor = toStripeMinorUnits(order.total, currency);
      if (!checkoutMatchesRecord(session, currency, amountMinor)) {
        logger.error("Checkout settlement does not match order currency or amount", {
          orderId: orderIdToUpdate,
          sessionId: session.id,
        });
        return;
      }
      const amountTotal = fromStripeMinorUnits(amountMinor, currency);
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
      // Update order status to confirmed and payment to paid
      await prisma.order.update({
        where: { id: orderIdToUpdate },
        data: {
          paymentStatus: "paid",
          status: order.status === "pending" ? "confirmed" : order.status,
          stripePaymentIntentId: paymentIntentId ?? undefined,
          updatedAt: new Date(),
        },
      });

      // Deduct stock and release reservation (if pending order)
      if (order.status === "pending") {
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              quantity: { decrement: item.quantity },
              reservedQuantity: { decrement: item.quantity },
            },
          });
        }
      }

      // Enterprise: auto-create or mark invoice for this order (every paid order has an invoice for records)
      try {
        await ensureInvoiceForPaidOrder(orderIdToUpdate!, amountTotal);
      } catch (invErr) {
        logger.error("Failed to ensure invoice for paid order", {
          orderId: orderIdToUpdate,
          error: invErr,
        });
        // Don't fail the webhook; order is already marked paid
      }

      // Global invalidation: order payment affects product/category/supplier detail Recent Orders
      const { invalidateOnOrderChange } = await import("@/lib/cache");
      await invalidateOnOrderChange();

      logger.info(`Order ${orderIdToUpdate} marked as paid and confirmed`);
    }
  } else if (type === "invoice" && (invoiceId || referenceId)) {
    const invoiceIdToUpdate = invoiceId || referenceId;

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    const invoiceForPayment = await prisma.invoice.findUnique({
      where: { id: invoiceIdToUpdate },
    });
    if (!invoiceForPayment) {
      logger.warn("Invoice not found for completed checkout", { invoiceId: invoiceIdToUpdate });
      return;
    }
    if (invoiceForPayment.status === "paid") return;
    const currency = resolveTransactionCurrency(invoiceForPayment.currency);
    const amountMinor = toStripeMinorUnits(invoiceForPayment.amountDue, currency);
    if (!checkoutMatchesRecord(session, currency, amountMinor)) {
      logger.error("Checkout settlement does not match invoice currency or amount", {
        invoiceId: invoiceIdToUpdate,
        sessionId: session.id,
      });
      return;
    }
    const amountTotal = fromStripeMinorUnits(amountMinor, currency);

    // Update invoice status to paid
    await prisma.invoice.update({
      where: { id: invoiceIdToUpdate },
      data: {
        status: "paid",
        amountPaid: amountTotal,
        amountDue: 0,
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntentId ?? undefined,
        updatedAt: new Date(),
      },
    });

    // Also update the related order: mark paid AND confirm (same as order checkout flow)
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceIdToUpdate },
      select: { orderId: true },
    });

    if (invoice?.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: invoice.orderId },
        include: { items: true },
      });

      if (order && order.paymentStatus !== "paid") {
        await prisma.order.update({
          where: { id: invoice.orderId },
          data: {
            paymentStatus: "paid",
            status: order.status === "pending" ? "confirmed" : order.status,
            updatedAt: new Date(),
          },
        });

        // Deduct stock and release reservation for pending orders (same as order checkout)
        if (order.status === "pending") {
          for (const item of order.items) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                quantity: { decrement: item.quantity },
                reservedQuantity: { decrement: item.quantity },
              },
            });
          }
        }
      } else if (order && order.paymentStatus === "paid" && order.status === "pending") {
        await prisma.order.update({
          where: { id: invoice.orderId },
          data: {
            status: "confirmed",
            updatedAt: new Date(),
          },
        });
      }
    }

    // Global invalidation: invoice payment updates order, affects all related caches
    const { invalidateOnOrderChange } = await import("@/lib/cache");
    await invalidateOnOrderChange();

    logger.info(`Invoice ${invoiceIdToUpdate} marked as paid`);
  }
}

/** Validates immutable checkout metadata against Stripe's completed amount and currency. */
function checkoutMatchesRecord(
  session: Stripe.Checkout.Session,
  currency: string,
  amountMinor: number,
): boolean {
  const metadataCurrency = session.metadata?.currency?.toUpperCase();
  const metadataAmount = session.metadata?.amountMinor;
  return (
    metadataCurrency === currency &&
    metadataAmount === String(amountMinor) &&
    session.currency?.toUpperCase() === currency &&
    session.amount_total === amountMinor
  );
}

/**
 * Handle expired checkout session
 */
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata) return;

  const { type, orderId, invoiceId, referenceId } = metadata;

  logger.info(
    `Checkout expired for ${type} ${referenceId || orderId || invoiceId}`,
  );

  // Optionally reset payment status or send notification
  // For now, just log it
}

/**
 * Handle charge refund (e.g. when refunded from Stripe Dashboard)
 * Syncs order/invoice status to "refunded" or "cancelled"
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) {
    logger.warn("Charge refunded but no payment_intent on charge");
    return;
  }

  logger.info(
    `Charge refunded: ${charge.id}, PaymentIntent: ${paymentIntentId}`,
  );

  // Find order with this PaymentIntent and mark refunded
  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { items: true, invoice: true },
  });
  if (order && order.paymentStatus !== "refunded") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "refunded",
        status: "cancelled",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // Restore stock for paid order items
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }
    // Cancel linked invoice if any
    if (order.invoice && order.invoice.status !== "cancelled") {
      await prisma.invoice.update({
        where: { id: order.invoice.id },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          amountDue: 0,
          updatedAt: new Date(),
        },
      });
    }
    logger.info(`Order ${order.id} marked refunded from charge.refunded`);
  }

  // Find invoice with this PaymentIntent (invoice checkout flow) and cancel it
  const invoiceRecord = await prisma.invoice.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { order: { include: { items: true } } },
  });
  if (invoiceRecord && invoiceRecord.status !== "cancelled") {
    await prisma.invoice.update({
      where: { id: invoiceRecord.id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
        amountDue: 0,
        updatedAt: new Date(),
      },
    });
    // Update linked order if any (invoice checkout flow)
    if (invoiceRecord.order && invoiceRecord.order.paymentStatus !== "refunded") {
      await prisma.order.update({
        where: { id: invoiceRecord.order.id },
        data: {
          paymentStatus: "refunded",
          status: "cancelled",
          cancelledAt: new Date(),
          updatedAt: new Date(),
        },
      });
      // Restore stock
      for (const item of invoiceRecord.order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }
    }
    logger.info(`Invoice ${invoiceRecord.id} marked cancelled from charge.refunded`);
  }

  if (order || invoiceRecord) {
    const { invalidateOnOrderChange } = await import("@/lib/cache");
    await invalidateOnOrderChange();
  }
}
